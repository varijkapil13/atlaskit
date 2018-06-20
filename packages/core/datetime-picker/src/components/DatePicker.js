// @flow

import Calendar from '@atlaskit/calendar';
import CalendarIcon from '@atlaskit/icon/glyph/calendar';
import Select, { mergeStyles } from '@atlaskit/select';
import { borderRadius, colors, layers } from '@atlaskit/theme';
import { format, isValid, parse } from 'date-fns';
import pick from 'lodash.pick';
import React, { Component, type Node, type ElementRef } from 'react';
import styled from 'styled-components';

import {
  ClearIndicator,
  DropdownIndicator,
  defaultDateFormat,
} from '../internal';
import FixedLayer from '../internal/FixedLayer';
import type { Event } from '../types';

/* eslint-disable react/no-unused-prop-types */
type Props = {
  /** Defines the appearance which can be default or subtle - no borders, background or icon.
   * Appearance values will be ignored if styles are parsed via the selectProps.
   */
  appearance?: 'default' | 'subtle',
  /** Whether or not to auto-focus the field. */
  autoFocus: boolean,
  /** Default for `isOpen`. */
  defaultIsOpen: boolean,
  /** Default for `value`. */
  defaultValue: string,
  /** An array of ISO dates that should be disabled on the calendar. */
  disabled: Array<string>,
  /** A function that formats the input value into the display value. */
  formatDisplayValue: (string, ...Array<*>) => string,
  /** The icon to show in the field. */
  icon: Node,
  /** The id of the field. Currently, react-select transforms this to have a "react-select-" prefix, and an "--input" suffix when applied to the input. For example, the id "my-input" would be transformed to "react-select-my-input--input". Keep this in mind when needing to refer to the ID. This will be fixed in an upcoming release. */
  id: string,
  /** Props to apply to the container. **/
  innerProps: Object,
  /** Whether or not the field is disabled. */
  isDisabled?: boolean,
  /** Whether or not the dropdown is open. */
  isOpen?: boolean,
  /** The name of the field. */
  name: string,
  /** Called when the field is blurred. */
  onBlur: (e: SyntheticFocusEvent<>) => void,
  /** Called when the value changes. The only argument is an ISO time. */
  onChange: string => void,
  /** Called when the field is focused. */
  onFocus: (e: SyntheticFocusEvent<>) => void,
  /** Props to apply to the select. This can be used to set options such as placeholder text.
   *  See [here](/packages/core/select) for documentation on select props. */
  selectProps: Object,
  /** The ISO time that should be used as the input value. */
  value?: string,
  /** Indicates current value is invalid & changes border color */
  isInvalid?: boolean,
  /** Hides icon for dropdown indicator. */
  hideIcon?: boolean,
  /** DEPRECATED: use formatDisplayValue instead. Format the date with a string that is accepted by [date-fns's format function](https://date-fns.org/v1.29.0/docs/format). */
  dateFormat: string,
  /** Placeholder text displayed in input */
  placeholder?: string,
};

type State = {
  isOpen: boolean,
  value: string,
  /** Value to be shown in the calendar as selected.  */
  selectedValue: string,
  view: string,
};

// TODO see if there's a different way to control the display value.
//
// react-select retains the value the user typed in until the field is
// blurred. Since we're controlling the open state and value, we need a
// way explicitly ensure the value is respected. By blurring and then
// immedately refocusing, we ensure the value is formatted and the input
// retains focus.
function ensureValueIsDisplayed() {
  const { activeElement } = document;
  if (activeElement) {
    activeElement.blur();
    activeElement.focus();
  }
}

function isoToObj(iso: string) {
  const parsed = parse(iso);
  return isValid(parsed)
    ? {
        day: parsed.getDate(),
        month: parsed.getMonth() + 1,
        year: parsed.getFullYear(),
      }
    : {};
}

const arrowKeys = {
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
};

const StyledMenu = styled.div`
  background-color: ${colors.N0};
  border: 1px solid ${colors.N40};
  border-radius: ${borderRadius()}px;
  box-shadow: 1px 5px 10px rgba(0, 0, 0, 0.1);
  margin: 7px 0;
  overflow: hidden;
  text-align: center;
  z-index: ${layers.dialog};
`;

export default class DatePicker extends Component<Props, State> {
  // $FlowFixMe - Calendar isn't being correctly detected as a react component
  calendar: ElementRef<Calendar>;
  containerRef: ?HTMLElement;
  input: Element | null;

  static defaultProps = {
    appearance: 'default',
    autoFocus: false,
    disabled: [],
    formatDisplayValue: (value: string, dateFormat: string) =>
      format(parse(value), dateFormat),
    icon: CalendarIcon,
    name: '',
    isDisabled: false,
    onBlur: () => {},
    onChange: () => {},
    onFocus: () => {},
    innerProps: {},
    selectProps: {},
    id: '',
    defaultIsOpen: false,
    defaultValue: '',
    isInvalid: false,
    hideIcon: false,
    dateFormat: defaultDateFormat,
    placeholder: `e.g. ${format(new Date(), defaultDateFormat)}`,
  };

  state = {
    isOpen: this.props.defaultIsOpen,
    value: this.props.defaultValue,
    view: '',
    selectedValue: this.props.value || this.props.defaultValue,
  };

  // All state needs to be accessed via this function so that the state is mapped from props
  // correctly to allow controlled/uncontrolled usage.
  getState = () => {
    return {
      ...this.state,
      ...pick(this.props, ['value', 'isOpen']),
    };
  };

  onCalendarChange = ({ iso }: { iso: string }) => {
    this.setState({ view: iso });
  };

  onCalendarSelect = ({ iso: value }: { iso: string }) => {
    this.triggerChange(value);
    this.setState({ isOpen: false, selectedValue: value });
  };

  onInputClick = () => {
    this.setState({ isOpen: true });
  };

  onSelectBlur = (e: SyntheticFocusEvent<>) => {
    this.setState({ isOpen: false });
    this.props.onBlur(e);
  };

  onSelectFocus = (e: SyntheticFocusEvent<>) => {
    this.setState({ isOpen: true });
    this.props.onFocus(e);
  };

  onSelectInput = (e: Event) => {
    let value = e.target.value;
    //const validForSelected = value.trim().match(/(\d{1,2})[- /.](\d{\d){1,2}})?\s*(a|p)?/i)
    if (value) {
      const parsed = parse(value);
      // Only try to set the date if we have month & day
      if (isValid(parsed)) {
        value = format(parsed, 'YYYY-MM-DD');
        this.triggerChange(value);
      }
    }
    this.setState({ isOpen: true });
  };

  onSelectKeyDown = (e: Event) => {
    const { key } = e;
    const dir = arrowKeys[key];
    const { view } = this.getState();

    if (dir) {
      // Calendar will not exist if it's not open and this also doubles as a
      // ref check since it may not exist.
      if (this.calendar) {
        // We don't want to move the caret if the calendar is open.
        if (dir === 'left' || dir === 'right') {
          e.preventDefault();
        }
        this.calendar.navigate(dir);
      } else if (dir === 'down' || dir === 'up') {
        this.setState({ isOpen: true });
      }
      // Escape closes the calendar & resets the value back to the last selected
    } else if (key === 'Escape') {
      if (this.state.isOpen) {
        this.triggerChange(this.state.selectedValue);
        this.setState({ isOpen: false });
      } else {
        this.setState({ selectedValue: '' });
        this.triggerChange('');
      }
    } else if (key === 'Enter' || key === 'Tab') {
      this.triggerChange(view);
      this.setState({ isOpen: false, selectedValue: this.state.value });
    }
  };

  refCalendar = (ref: ElementRef<Calendar>) => {
    this.calendar = ref;
  };

  triggerChange = (value: string) => {
    this.props.onChange(value);
    this.setState({ value, view: value });
    ensureValueIsDisplayed();
  };

  getContainerRef = (ref: ?HTMLElement) => {
    const oldRef = this.containerRef;
    this.containerRef = ref;
    // Cause a re-render if we're getting the container ref for the first time
    // as the layered menu requires it for dimension calculation
    if (oldRef == null && ref != null) {
      this.forceUpdate();
    }
  };

  getSubtleControlStyles = () => {
    return {
      border: `2px solid ${
        this.getState().isOpen ? `${colors.B100}` : `transparent`
      }`,
      backgroundColor: 'transparent',
      padding: '1px',
    };
  };

  render() {
    const {
      autoFocus,
      disabled,
      formatDisplayValue,
      id,
      innerProps,
      isDisabled,
      name,
      selectProps,
      dateFormat,
      placeholder,
    } = this.props;
    const { value, view } = this.getState();
    const validationState = this.props.isInvalid ? 'error' : 'default';
    const icon =
      this.props.appearance === 'subtle' || this.props.hideIcon
        ? null
        : this.props.icon;
    const Menu = ({ innerProps: menuInnerProps }) => (
      <StyledMenu>
        <Calendar
          {...isoToObj(value)}
          {...isoToObj(view)}
          disabled={disabled}
          onChange={this.onCalendarChange}
          onSelect={this.onCalendarSelect}
          // $FlowFixMe
          ref={this.refCalendar}
          selected={[this.state.selectedValue]}
          innerProps={menuInnerProps}
        />
      </StyledMenu>
    );

    const FixedLayeredMenu = props => (
      <FixedLayer
        containerRef={this.containerRef}
        content={<Menu {...props} />}
      />
    );
    const { styles: selectStyles = {} } = selectProps;
    const controlStyles =
      this.props.appearance === 'subtle' ? this.getSubtleControlStyles() : {};

    return (
      <div
        {...innerProps}
        role="presentation"
        onClick={this.onInputClick}
        onInput={this.onSelectInput}
        onKeyDown={this.onSelectKeyDown}
        ref={this.getContainerRef}
      >
        <input name={name} type="hidden" value={value} />
        {/* $FlowFixMe - complaining about required args that aren't required. */}
        <Select
          escapeClearsValue
          closeMenuOnSelect
          autoFocus={autoFocus}
          instanceId={id}
          isDisabled={isDisabled}
          onBlur={this.onSelectBlur}
          onFocus={this.onSelectFocus}
          components={{
            ClearIndicator,
            DropdownIndicator: () => <DropdownIndicator icon={icon} />,
            Menu: FixedLayeredMenu,
          }}
          styles={mergeStyles(selectStyles, {
            control: base => ({
              ...base,
              ...controlStyles,
            }),
          })}
          placeholder={placeholder}
          value={
            value && {
              label: formatDisplayValue(value, dateFormat),
              value,
            }
          }
          {...selectProps}
          validationState={validationState}
        />
      </div>
    );
  }
}
