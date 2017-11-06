import * as React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { ReactUnsupportedBlockNode } from '../../../src/nodeviews';

describe('unsupportedBlock - React component', () => {
  it('should return a node of type div', () => {
    const wrapper = mount(<ReactUnsupportedBlockNode/>);
    expect(wrapper.getDOMNode().tagName).to.equal('DIV');
    wrapper.unmount();
  });

  it('should have text content as string "Unsupported content"', () => {
    const wrapper = mount(<ReactUnsupportedBlockNode/>);
    expect(wrapper.text()).to.equal('Unsupported content');
    wrapper.unmount();
  });
});
