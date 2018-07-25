/* eslint-disable react/no-array-index-key */
import React from "react";
import debounce from "lodash/debounce";

const getRelativeParent = element => {
  if (!element) {
    return null;
  }

  const position = window
    .getComputedStyle(element)
    .getPropertyValue("position");
  if (position !== "static") {
    return element;
  }

  return getRelativeParent(element.parentElement);
};

export default class Toolbar extends React.Component {
  state = {
    /**
     * If this is set, the toolbar will render this instead of the regular
     * structure and will also be shown when the editor loses focus.
     * @type {Component}
     */
    overrideContent: undefined,
    isOut: false,
    top: null,
    width: null
  };

  componentDidMount = () => {
    window.addEventListener("scroll", this.handleScroll);
  };

  componentWillUnmount = () => {
    window.removeEventListener("scroll", this.handleScroll);
  };

  handleScroll = debounce(event => {
    const { isOut } = this.state;
    const toolbarRect = this.toolbar.getBoundingClientRect();
    const parent = this.toolbar.parentElement.getBoundingClientRect();

    if (
      parent.top - toolbarRect.height < 0 &&
      parent.height + parent.top - toolbarRect.height > 0
    ) {
      const parentPadding = parseInt(
        window
          .getComputedStyle(this.toolbar.parentElement)
          .getPropertyValue("padding"),
        10
      );
      this.setState({
        isOut: true,
        top: window.scrollY,
        width: parent.width - 2 * parentPadding
      });
    } else if (isOut) {
      this.setState({ isOut: false });
    }
  }, 300);

  // componentWillMount() {
  //   this.props.store.subscribeToItem('selection', () => this.forceUpdate());
  // }

  // componentWillUnmount() {
  //   this.props.store.unsubscribeFromItem('selection', () => this.forceUpdate());
  // }

  /**
   * This can be called by a child in order to render custom content instead
   * of the regular structure. It's the responsibility of the callee to call
   * this function again with `undefined` in order to reset `overrideContent`.
   * @param {Component} overrideContent
   */
  onOverrideContent = overrideContent => this.setState({ overrideContent });

  getStyle = () => {
    const { isOut, top, width } = this.state;
    return isOut ? { position: "absolute", top, width } : {};
  };

  handleToolbarRef = node => {
    this.toolbar = node;
  };

  render() {
    const { theme, store, structure } = this.props;
    const { overrideContent: OverrideContent } = this.state;
    const childrenProps = {
      theme: theme.buttonStyles,
      getEditorState: store.getItem("getEditorState"),
      setEditorState: store.getItem("setEditorState"),
      onOverrideContent: this.onOverrideContent
    };

    return (
      <div
        className={theme.toolbarStyles.toolbar}
        style={this.getStyle()}
        ref={this.handleToolbarRef}
      >
        {OverrideContent ? (
          <OverrideContent {...childrenProps} />
        ) : (
          structure.map((Component, index) => (
            <Component key={index} {...childrenProps} />
          ))
        )}
      </div>
    );
  }
}
