// @flow

import type { ComponentType } from 'react';

import {
  withAnalyticsEvents,
  withAnalyticsContext,
  type WithAnalyticsEventsProps,
} from '@atlaskit/analytics-next';
import type { ViewLayer } from '../view-controller/types';

export const navigationChannel = 'navigation';

function getDisplayName(component) {
  return component ? component.displayName || component.name : undefined;
}

function kebabToCamelCase(str: string) {
  return `${str}`.replace(/-([a-z])/gi, g => g[1].toUpperCase());
}

function getClickHandler(componentName) {
  return function navItemAnalyticsClickHandler(createAnalyticsEvent, props) {
    const event = createAnalyticsEvent({
      action: 'clicked',
      actionSubject: 'navigationItem',
      attributes: {
        componentName,
        iconSource: getDisplayName(props.icon) || getDisplayName(props.before),
        itemId: kebabToCamelCase(props.id),
        navigationItemIndex: props.index,
      },
    });

    event.fire(navigationChannel);

    return null;
  };
}

export const navigationItemClicked = (
  Component: ComponentType<any>,
  componentName: string,
): ComponentType<any> => {
  return withAnalyticsContext({
    componentName,
  })(
    withAnalyticsEvents({
      onClick: getClickHandler(componentName),
    })(Component),
  );
};

export const navigationUILoaded = (
  createAnalyticsEvent: $PropertyType<
    WithAnalyticsEventsProps,
    'createAnalyticsEvent',
  >,
  { layer }: { layer: ViewLayer },
) =>
  createAnalyticsEvent({
    action: 'initialised',
    actionSubject: 'navigationUI',
    actionSubjectId: layer,
    eventType: 'operational',
  }).fire(navigationChannel);

export const navigationExpandedCollapsed = (
  createAnalyticsEvent: $PropertyType<
    WithAnalyticsEventsProps,
    'createAnalyticsEvent',
  >,
  { isCollapsed, trigger }: { isCollapsed: boolean, trigger: string },
) =>
  createAnalyticsEvent({
    action: isCollapsed ? 'collapsed' : 'expanded',
    actionSubject: 'productNavigation',
    attributes: {
      trigger,
    },
  }).fire(navigationChannel);
