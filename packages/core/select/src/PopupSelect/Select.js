// @flow

import React, {
  PureComponent,
  type ElementRef,
  type Element,
  type Node,
} from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import createFocusTrap from 'focus-trap';
import {
  Manager,
  Reference,
  Popper,
  type PopperProps,
  type PopperChildrenProps,
} from 'react-popper';
import NodeResolver from 'react-node-resolver';

import { colors } from '@atlaskit/theme';

import { MenuDialog, DummyControl, defaultComponents } from './components';

// ==============================
// Types
// ==============================

type PopperChildren = { children: PopperChildrenProps => Node };
type PopperPropsNoChildren = $Diff<PopperProps, PopperChildren>;
type Props = {
  closeMenuOnSelect: boolean,
  components: Object,
  footer?: Node,
  minMenuWidth: number,
  maxMenuWidth: number,
  maxMenuHeight: number,
  onChange?: (value: Object, actionMeta: Object) => void,
  onOpen?: () => void,
  onClose?: () => void,
  options: Array<Object>,
  popperProps?: PopperPropsNoChildren,
  searchThreshold: number,
  styles: Object,
  target: Element<*>,
};
type State = { isOpen: boolean };

// ==============================
// Class
// ==============================

const defaultStyles = {
  groupHeading: provided => ({ ...provided, color: colors.N80 }),
};

export default class PopupSelect extends PureComponent<Props, State> {
  components: Object;
  focusTrap: Object;
  menuRef: HTMLElement;
  popperProps: PopperPropsNoChildren;
  selectRef: ElementRef<*>;
  targetRef: HTMLElement;

  static defaultProps = {
    closeMenuOnSelect: true,
    components: defaultComponents,
    maxMenuHeight: 300,
    maxMenuWidth: 440,
    minMenuWidth: 220,
    popperProps: {},
    searchThreshold: 5,
    styles: {},
  };

  constructor(props: Props) {
    super(props);
    this.cacheComponents(props.components);
    this.state = { isOpen: false };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.components !== this.props.components) {
      this.cacheComponents(nextProps.components);
    }
  }
  cacheComponents = (components?: {}) => {
    this.components = {
      ...defaultComponents,
      ...components,
    };
  };
  componentDidMount() {
    this.mergePopperProps();
    document.addEventListener('click', this.handleClick);
  }
  // TODO work around this before react@17
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.popperProps !== this.props.popperProps) {
      this.mergePopperProps();
    }
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  // Event Handlers
  // ==============================

  handleKeyDown = ({ key }: KeyboardEvent) => {
    switch (key) {
      case 'Escape':
        this.close();
        break;
      default:
    }
  };
  handleClick = ({ target }: MouseEvent) => {
    const { isOpen } = this.state;

    // appease flow
    if (!(target instanceof HTMLElement)) return;

    // NOTE: Why not use the <Blanket /> component to close?
    // We don't want to interupt the user's flow. Taking this approach allows
    // user to click "through" to other elements and close the popout.
    if (isOpen && !this.menuRef.contains(target)) {
      this.close();
    }

    // open on target click -- we can't trust consumers to spread the onClick
    // property to the target
    if (!isOpen && this.targetRef.contains(target)) {
      this.open();
    }
  };
  handleSelectChange = (value: Object, actionMeta: Object) => {
    const { closeMenuOnSelect, onChange } = this.props;
    if (closeMenuOnSelect) this.close();
    if (onChange) onChange(value, actionMeta);
  };

  // Internal Lifecycle
  // ==============================

  open = () => {
    const { onOpen } = this.props;
    if (onOpen) onOpen();

    this.setState({ isOpen: true }, this.initialiseFocusTrap);
    this.selectRef.select.focusOption('first'); // HACK
    window.addEventListener('keydown', this.handleKeyDown);
  };
  initialiseFocusTrap = () => {
    const trapConfig = {
      clickOutsideDeactivates: true,
      escapeDeactivates: true,
      fallbackFocus: this.menuRef,
      returnFocusOnDeactivate: true,
    };
    this.focusTrap = createFocusTrap(this.menuRef, trapConfig);
    this.focusTrap.activate();
  };
  close = () => {
    const { onClose } = this.props;
    if (onClose) onClose();

    this.setState({ isOpen: false });
    this.focusTrap.deactivate();
    window.removeEventListener('keydown', this.handleKeyDown);
  };

  // Refs
  // ==============================

  resolveTargetRef = (popperRef: ElementRef<*>) => (ref: HTMLElement) => {
    this.targetRef = ref;
    popperRef(ref);
  };
  resolveMenuRef = (popperRef: ElementRef<*>) => (ref: HTMLElement) => {
    this.menuRef = ref;
    popperRef(ref);
  };
  getSelectRef = (ref: ElementRef<*>) => {
    this.selectRef = ref;
  };

  // Utils
  // ==============================

  // account for groups when counting options
  // this may need to be recursive, right now it just counts one level
  getItemCount = () => {
    const { options } = this.props;
    let count = 0;

    options.forEach(groupOrOption => {
      if (groupOrOption.options) {
        groupOrOption.options.forEach(() => count++);
      } else {
        count++;
      }
    });

    return count;
  };
  mergePopperProps = () => {
    const defaults = {
      modifiers: { offset: { offset: `0, 8` } },
      placement: 'bottom-start',
    };

    this.popperProps = Object.assign({}, defaults, this.props.popperProps);
  };
  getMaxHeight = () => {
    const { maxMenuHeight } = this.props;

    if (!this.selectRef) return maxMenuHeight;

    // subtract the control height to maintain continuity
    const showSearchControl = this.showSearchControl();
    const offsetHeight = showSearchControl
      ? this.selectRef.select.controlRef.offsetHeight
      : 0;
    const maxHeight = maxMenuHeight - offsetHeight;

    return maxHeight;
  };

  // if the threshold is exceeded display the search control
  showSearchControl = () => {
    const { searchThreshold } = this.props;
    return this.getItemCount() > searchThreshold;
  };

  // Renderers
  // ==============================

  renderSelect = () => {
    const { footer, maxMenuWidth, minMenuWidth, target, ...props } = this.props;
    const { isOpen } = this.state;
    const { components } = this;
    const showSearchControl = this.showSearchControl();
    const portalDestination = document.body;

    if (!portalDestination || !isOpen) return null;

    const popper = (
      <Popper {...this.popperProps}>
        {({ placement, ref, style }) => {
          return (
            <NodeResolver innerRef={this.resolveMenuRef(ref)}>
              <MenuDialog
                style={style}
                data-placement={placement}
                minWidth={minMenuWidth}
                maxWidth={maxMenuWidth}
              >
                <Select
                  backspaceRemovesValue={false}
                  controlShouldRenderValue={false}
                  isClearable={false}
                  tabSelectsValue={false}
                  menuIsOpen
                  ref={this.getSelectRef}
                  {...props}
                  styles={{ ...defaultStyles, ...props.styles }}
                  maxMenuHeight={this.getMaxHeight()}
                  components={{
                    ...components,
                    Control: showSearchControl
                      ? components.Control
                      : DummyControl,
                  }}
                  onChange={this.handleSelectChange}
                />
                {footer}
              </MenuDialog>
            </NodeResolver>
          );
        }}
      </Popper>
    );

    return this.popperProps.positionFixed
      ? popper
      : createPortal(popper, portalDestination);
  };

  render() {
    const { target } = this.props;

    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <NodeResolver innerRef={this.resolveTargetRef(ref)}>
              {target}
            </NodeResolver>
          )}
        </Reference>
        {this.renderSelect()}
      </Manager>
    );
  }
}