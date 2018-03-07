// @flow

import { mount, shallow } from 'enzyme';
import React, { Component } from 'react';
import {
  AnalyticsListener,
  AnalyticsContext,
  UIAnalyticsEvent,
} from '@atlaskit/analytics-next';
import Button from '@atlaskit/button';

import {
  name as packageName,
  version as packageVersion,
} from '../package.json';

import { BreadcrumbsItem as Item } from '../src/components/BreadcrumbsItem';

import BreadcrumbsStatelessWithAnalytics, {
  BreadcrumbsStateless,
} from '../src/components/BreadcrumbsStateless';

import EllipsisItem from '../src/components/EllipsisItem';

describe('BreadcrumbsStateless', () => {
  describe('exports', () => {
    it('the React component, and the Item component', () => {
      expect(BreadcrumbsStateless).not.toBe(undefined);
      expect(Item).not.toBe(undefined);
      expect(new BreadcrumbsStateless()).toBeInstanceOf(Component);
      expect(new Item()).toBeInstanceOf(Component);
    });
  });

  describe('construction', () => {
    it('should be able to create a component', () => {
      const wrapper = shallow(<BreadcrumbsStateless onExpand={() => {}} />);
      expect(wrapper).not.toBe(undefined);
      expect(wrapper.instance()).toBeInstanceOf(Component);
    });

    it('should be able to render a single child', () => {
      const wrapper = shallow(
        <BreadcrumbsStateless onExpand={() => {}}>
          <Item text="item" />
        </BreadcrumbsStateless>,
      );
      expect(wrapper.find(Item)).toHaveLength(1);
    });

    it('should render multiple children', () => {
      const wrapper = mount(
        <BreadcrumbsStateless onExpand={() => {}}>
          <Item text="item" />
          <Item text="item" />
          <Item text="item" />
        </BreadcrumbsStateless>,
      );
      expect(wrapper.find(Item).length).toBe(3);
    });

    it('should not count empty children', () => {
      const wrapper = mount(
        <BreadcrumbsStateless onExpand={() => {}} maxItems={3}>
          {null}
          <Item text="item" />
          <Item text="item" />
          <Item text="item" />
          {undefined}
          {false}
        </BreadcrumbsStateless>,
      );
      expect(wrapper.find(Item).length).toBe(3);
      expect(
        wrapper
          .find(Item)
          .last()
          .props().hasSeparator,
      ).toBe(false);
    });

    describe('with enough items to collapse', () => {
      const firstItem = <Item hasSeparator text="item1" />;
      const lastItem = <Item text="item2" />;
      const expandSpy = jest.fn();
      let wrapper;

      describe('and not expanded', () => {
        beforeEach(() => {
          wrapper = mount(
            <BreadcrumbsStateless maxItems={4} onExpand={expandSpy}>
              {firstItem}
              <Item text="item2" />
              <Item text="item3" />
              <Item text="item4" />
              {lastItem}
            </BreadcrumbsStateless>,
          );
        });

        it('renders only the first and last items, and an ellipsis item', () => {
          expect(wrapper.find(Item).length).toBe(2);
          expect(wrapper.contains(firstItem)).toBe(true);
          expect(wrapper.contains(lastItem)).toBe(true);
          expect(wrapper.find(EllipsisItem).length).toBe(1);
        });

        it('calls the onExpand handler when the ellipsis is clicked', () => {
          const ellipsisItem = wrapper.find(EllipsisItem);
          ellipsisItem.find(Button).simulate('click');
          expect(expandSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe('and expanded', () => {
        beforeEach(() => {
          wrapper = mount(
            <BreadcrumbsStateless onExpand={() => {}} maxItems={4} isExpanded>
              <Item text="item1" />
              <Item text="item2" />
              <Item text="item3" />
              <Item text="item4" />
            </BreadcrumbsStateless>,
          );
        });

        it('renders all the items', () => {
          expect(wrapper.props().isExpanded).toBe(true);
          expect(wrapper.find(Item).length).toBe(4);
          expect(wrapper.find(EllipsisItem).length).toBe(0);
        });
      });
    });
  });
});
describe('analytics - BreadcrumbsStateless', () => {
  it('should provide analytics context with component, package and version fields', () => {
    const wrapper = shallow(<BreadcrumbsStatelessWithAnalytics />);

    expect(wrapper.find(AnalyticsContext).prop('data')).toEqual({
      component: 'breadcrumbs',
      package: packageName,
      version: packageVersion,
    });
  });

  it('should pass analytics event as last argument to onExpand handler', () => {
    const spy = jest.fn();
    const wrapper = mount(<BreadcrumbsStatelessWithAnalytics onExpand={spy} />);
    wrapper.find('button').simulate('expand');

    const analyticsEvent = spy.mock.calls[0][1];
    expect(analyticsEvent).toEqual(expect.any(UIAnalyticsEvent));
    expect(analyticsEvent.payload).toEqual(
      expect.objectContaining({
        action: 'expand',
      }),
    );
  });

  it('should fire an atlaskit analytics event on expand', () => {
    const spy = jest.fn();
    const wrapper = mount(
      <AnalyticsListener onEvent={spy} channel="atlaskit">
        <BreadcrumbsStatelessWithAnalytics />
      </AnalyticsListener>,
    );

    wrapper.find(BreadcrumbsStatelessWithAnalytics).simulate('expand');
    const [analyticsEvent, channel] = spy.mock.calls[0];

    expect(channel).toBe('atlaskit');
    expect(analyticsEvent.payload).toEqual({ action: 'expand' });
    expect(analyticsEvent.context).toEqual([
      {
        component: 'breadcrumbs',
        package: packageName,
        version: packageVersion,
      },
    ]);
  });
});
