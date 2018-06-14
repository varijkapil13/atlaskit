// @flow

import React, { Component, type Node } from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'react-focus-lock';

type Props = {
  /**
    DOM Element to apply `aria-hidden=true` to when this component gains focus.
    This is provided via context when used within @atlaskit/layer-manager.
  */
  ariaHiddenNode?: HTMLElement,
  /**
    Boolean OR Function indicating which element to focus when the component
    initialises (mounts or becomes enabled):
    - undefined sets the focus on the boundary itself
    - FALSE assumes the user has set autoFocus on another element within the boundary
    - TRUE will automatically find the first "tabbable" element within the boundary
    - Providing a function should return the element you want to focus
  */
  autoFocus: AutoFocus,
  /**
    Accepts a single child
  */
  children?: Node,
  /**
    Toggle focus management outside of mount/unmount lifecycle methods
  */
  enabled: boolean,
};

/* eslint-disable react/sort-comp */
export default class FocusLock extends Component<Props> {
  ariaHiddenNode: HTMLElement;
  initFromProps: boolean = false;
  teardownFromProps: boolean = false;
  static contextTypes = {
    /** available when invoked within @atlaskit/layer-manager */
    ariaHiddenNode: PropTypes.object,
  };
  static defaultProps = {
    autoFocus: true,
    enabled: true,
  };

  componentDidMount() {
    const { enabled } = this.props;

    if (typeof autoFocus === 'function') {
      console.warn(
        '@atlaskit/layer-manager warning: passing a function as autoFocus in FocusLock is deprecated. Please see...',
      );
    }

    if (enabled) {
      this.initialise();
    }
  }
  componentWillUnmount() {
    if (!this.initFromProps && !this.teardownFromProps) {
      this.teardown();
    }
  }
  componentDidUpdate(prevProps: Props) {
    if (this.props.enabled && this.props.enabled !== prevProps.enabled) {
      this.initFromProps = true;
      this.initialise();
    }

    if (!this.props.enabled && this.props.enabled !== prevProps.enabled) {
      this.teardownFromProps = true;
      this.teardown();
    }
  }

  initialise = () => {
    const { autoFocus } = this.props;
    // set the element to hide from assistive technology
    this.ariaHiddenNode =
      this.props.ariaHiddenNode || this.context.ariaHiddenNode;

    // accessible `popup` content
    if (this.ariaHiddenNode) {
      this.ariaHiddenNode.setAttribute('aria-hidden', '');
    }
    if (typeof autoFocus === 'function') {
      const elem = autoFocus();
      if (elem && elem.focus) {
        elem.focus();
      }
    }
  };
  teardown = () => {
    if (this.ariaHiddenNode) {
      this.ariaHiddenNode.removeAttribute('aria-hidden');
    }
  };

  render() {
    const { enabled, autoFocus } = this.props;
    const shouldAutoFocus = typeof autoFocus === 'boolean' && autoFocus;
    return (
      <FocusTrap disabled={!enabled} autoFocus={shouldAutoFocus}>
        {this.props.children}
      </FocusTrap>
    );
  }
}
