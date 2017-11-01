// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { name } from '../package.json';
import DatePickerStateless from '../src/components//DatePickerStateless';
import Picker from '../src/components/internal/Picker';
import DateField from '../src/components/internal/DateField';
import DateDialog from '../src/components/internal/DateDialog';

describe(name, () => {
  describe('DatePickerStateless', () => {
    it('renders a Picker with a DateDialog and DateField', () => {
      const wrapper = shallow(<DatePickerStateless />);

      expect(wrapper.find(Picker)).toHaveLength(1);
      const pickerProps = wrapper.find(Picker).props();
      expect(pickerProps.field).toBe(DateField);
      expect(pickerProps.dialog).toBe(DateDialog);
    });
  });
});
