// @flow
import React from 'react';
import { shallow, mount } from 'enzyme';
import {
  AnalyticsListener,
  AnalyticsContext,
  UIAnalyticsEvent,
} from '@atlaskit/analytics-next';
import Layer from '@atlaskit/layer';
import Spinner from '@atlaskit/spinner';
import Item, { ItemGroup } from '@atlaskit/item';

import {
  name,
  name as packageName,
  version as packageVersion,
} from '../../package.json';

import { Trigger, Content } from '../../src/styled/Droplist';

import DroplistWithAnalytics, { Droplist } from '../components/Droplist';
import DroplistItemWithAnalytics, { DroplistItem } from '../components/Item';

const itemsList = (
  <ItemGroup heading="test1">
    <Item>Some text</Item>
  </ItemGroup>
);

describe(`${name} - core`, () => {
  it('should be possible to create a component', () => {
    expect(shallow(<Droplist>test</Droplist>)).not.toBe(undefined);
  });

  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Droplist trigger="text" isOpen maxHeight={100}>
          {itemsList}
        </Droplist>,
      );
    });

    it('should render Layer component', () => {
      const layer = wrapper.find(Layer);
      // Check that layer received our content
      expect(layer.find(ItemGroup).length).toBe(1);
      expect(layer.find(Trigger).length).toBe(1);
    });

    it('should pass required properties to Layer', () => {
      const layer = wrapper.find(Layer);
      expect(layer.prop('offset')).toBe('0 8px');
      expect(layer.prop('position')).toBe('bottom left');
      expect(layer.prop('autoFlip')).toBe(wrapper.props().shouldFlip);
      expect(layer.prop('boundariesElement')).toBe('viewport');
      expect(layer.prop('content')).not.toBe(undefined);
    });

    it('should render dropdown list content with height of maxHeight', () => {
      expect(
        wrapper
          .find(Content)
          .at(0)
          .prop('maxHeight'),
      ).toBe(100);
    });

    it('should render droplist content', () => {
      // We passed a group as content so we should be able to find one
      expect(wrapper.find(ItemGroup).length).toBe(1);
    });

    it('should render trigger', () => {
      const triggerWrapper = wrapper.find(Trigger);
      expect(triggerWrapper.text()).toBe('text');
    });
  });

  describe('max height (appearance prop)', () => {
    it('should constrain max height on content by default', () => {
      expect(
        mount(<Droplist isOpen />)
          .find(Content)
          .prop('isTall'),
      ).toBe(false);
    });
    it('should not set max height if appearance = tall', () => {
      expect(
        mount(<Droplist isOpen appearance="tall" />)
          .find(Content)
          .prop('isTall'),
      ).toBe(true);
    });
  });

  describe('onOpenChange', () => {
    it('should be open when the isOpen property set to true', () => {
      const wrapper = mount(<Droplist trigger="text">{itemsList}</Droplist>);
      const hasItemGroup = () => wrapper.find(ItemGroup).length === 1;
      const isContentVisible = () => wrapper.find(Content).length === 1;

      expect(hasItemGroup()).toBe(false);
      expect(isContentVisible()).toBe(false);

      wrapper.setProps({ isOpen: true });
      expect(hasItemGroup()).toBe(true);
      expect(isContentVisible()).toBe(true);
    });
  });

  describe('loading', () => {
    it('should show a Spinner (and no Groups) when it is loading and open', () => {
      const wrapper = mount(
        <Droplist isLoading isOpen>
          {itemsList}
        </Droplist>,
      );
      expect(wrapper.find(Spinner).length).toBe(1);
      expect(wrapper.find(ItemGroup).length).toBe(0);
    });

    it('should not show a Spinner when it is loading but not open', () => {
      const wrapper = mount(<Droplist isLoading>{itemsList}</Droplist>);
      expect(wrapper.find(Spinner).length).toBe(0);
    });
  });
});
describe('analytics - Droplist', () => {
  it('should provide analytics context with component, package and version fields', () => {
    const wrapper = shallow(<DroplistWithAnalytics />);

    expect(wrapper.find(AnalyticsContext).prop('data')).toEqual({
      component: 'droplist',
      package: packageName,
      version: packageVersion,
    });
  });

  it('should pass analytics event as last argument to onOpenChange handler', () => {
    const spy = jest.fn();
    const wrapper = mount(<DroplistWithAnalytics onOpenChange={spy} />);
    wrapper.find('button').simulate('toggle');

    const analyticsEvent = spy.mock.calls[0][1];
    expect(analyticsEvent).toEqual(expect.any(UIAnalyticsEvent));
    expect(analyticsEvent.payload).toEqual(
      expect.objectContaining({
        action: 'toggle',
      }),
    );
  });

  it('should fire an atlaskit analytics event on toggle', () => {
    const spy = jest.fn();
    const wrapper = mount(
      <AnalyticsListener onEvent={spy} channel="atlaskit">
        <DroplistWithAnalytics />
      </AnalyticsListener>,
    );

    wrapper.find(DroplistWithAnalytics).simulate('toggle');
    const [analyticsEvent, channel] = spy.mock.calls[0];

    expect(channel).toBe('atlaskit');
    expect(analyticsEvent.payload).toEqual({ action: 'toggle' });
    expect(analyticsEvent.context).toEqual([
      {
        component: 'droplist',
        package: packageName,
        version: packageVersion,
      },
    ]);
  });
});
describe('analytics - DroplistItem', () => {
  it('should provide analytics context with component, package and version fields', () => {
    const wrapper = shallow(<DroplistItemWithAnalytics />);

    expect(wrapper.find(AnalyticsContext).prop('data')).toEqual({
      component: 'droplist-item',
      package: packageName,
      version: packageVersion,
    });
  });

  it('should pass analytics event as last argument to onActivate handler', () => {
    const spy = jest.fn();
    const wrapper = mount(<DroplistItemWithAnalytics onActivate={spy} />);
    wrapper.find('button').simulate('activate');

    const analyticsEvent = spy.mock.calls[0][1];
    expect(analyticsEvent).toEqual(expect.any(UIAnalyticsEvent));
    expect(analyticsEvent.payload).toEqual(
      expect.objectContaining({
        action: 'activate',
      }),
    );
  });

  it('should fire an atlaskit analytics event on activate', () => {
    const spy = jest.fn();
    const wrapper = mount(
      <AnalyticsListener onEvent={spy} channel="atlaskit">
        <DroplistItemWithAnalytics />
      </AnalyticsListener>,
    );

    wrapper.find(DroplistItemWithAnalytics).simulate('activate');
    const [analyticsEvent, channel] = spy.mock.calls[0];

    expect(channel).toBe('atlaskit');
    expect(analyticsEvent.payload).toEqual({ action: 'activate' });
    expect(analyticsEvent.context).toEqual([
      {
        component: 'droplist-item',
        package: packageName,
        version: packageVersion,
      },
    ]);
  });
});
