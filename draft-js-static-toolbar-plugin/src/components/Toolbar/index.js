/* eslint-disable react/no-array-index-key */
import React from "react";

const RATIO_NUMBER = 100;

export default class Toolbar extends React.Component {
  toolbar = undefined;
  parentPadding = undefined;
  parentWidth = undefined;
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
    this.parentWidth = this.toolbar.parentElement.getBoundingClientRect().width;
    this.parentPadding = parseInt(
      window
        .getComputedStyle(this.toolbar.parentElement)
        .getPropertyValue("padding"),
      10
    );
    this.createObserver();
  };

  handleIntersect = entries => {
    const toolbar = entries[0].boundingClientRect;

    if (toolbar.top < 0) {
      this.setState({
        isOut: true,
        top: window.scrollY,
        width: this.parentWidth - 2 * this.parentPadding
      });
    } else if (this.state.isOut) {
      this.setState({ isOut: false });
    }
  };

  buildThresholdList = () => {
    const thresholds = [];

    for (var i = 1.0; i <= RATIO_NUMBER; i++) {
      const ratio = i / RATIO_NUMBER;
      thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  };

  createObserver = () => {
    const horizontalMargin = -(
      this.toolbar.getBoundingClientRect().height + this.parentPadding
    );

    var options = {
      root: null,
      rootMargin: `${horizontalMargin}px 0px ${horizontalMargin}px 0px`,
      threshold: this.buildThresholdList()
    };

    const observer = new IntersectionObserver(this.handleIntersect, options);
    observer.observe(this.toolbar.parentElement);
  };

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
