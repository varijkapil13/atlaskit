import * as React from 'react';
import {
  withAnalyticsEvents,
  createAndFireEvent,
} from '@atlaskit/analytics-next';
import { EventType } from '@atlaskit/analytics-gas-types';
import Button from '@atlaskit/button';
import { FabricChannel } from '../../src/types';
import { WithAnalyticsEventProps } from '@atlaskit/analytics-next-types';

export type OwnProps = {
  onClick: (e) => void;
};

export type Props = WithAnalyticsEventProps & OwnProps;

const CustomButton = ({ onClick, text }) => (
  <div id="dummy" onClick={onClick} style={{ paddingBottom: 12 }}>
    <Button appearance="help">{text || 'Test'}</Button>
  </div>
);

export class DummyElementsComponent extends React.Component<Props> {
  static displayName = 'DummyElementsComponent';

  render() {
    return (
      <CustomButton
        text={FabricChannel.elements}
        onClick={this.props.onClick}
      />
    );
  }
}

export class DummyAtlaskitComponent extends React.Component<Props> {
  static displayName = 'DummyAtlaskitComponent';
  render() {
    return (
      <CustomButton
        text={FabricChannel.atlaskit}
        onClick={this.props.onClick}
      />
    );
  }
}

export class DummyNavigationComponent extends React.Component<Props> {
  static displayName = 'DummyNavigationComponent';
  render() {
    return (
      <CustomButton
        text={FabricChannel.navigation}
        onClick={this.props.onClick}
      />
    );
  }
}

export class DummyEditorComponent extends React.Component<Props> {
  static displayName = 'DummyEditorComponent';
  render() {
    return (
      <CustomButton text={FabricChannel.editor} onClick={this.props.onClick} />
    );
  }
}

class MyButton extends React.Component<Props> {
  static displayName = 'MyButton';
  render() {
    return (
      <button id="dummy" onClick={this.props.onClick}>
        Test [click on me]
      </button>
    );
  }
}

const componentChannels = {
  [FabricChannel.atlaskit]: DummyAtlaskitComponent,
  [FabricChannel.elements]: DummyElementsComponent,
  [FabricChannel.navigation]: DummyNavigationComponent,
  [FabricChannel.editor]: DummyEditorComponent,
};

export const createComponentWithAnalytics = (channel: FabricChannel) =>
  withAnalyticsEvents({
    onClick: createAndFireEvent(channel)({
      action: 'someAction',
      actionSubject: 'someComponent',
      eventType: 'ui',
      source: 'unknown',
    }),
  })(componentChannels[channel]);

export const createComponentWithAttributesWithAnalytics = (
  channel: FabricChannel,
) =>
  withAnalyticsEvents({
    onClick: createAndFireEvent(channel)({
      action: 'someAction',
      actionSubject: 'someComponent',
      eventType: 'ui',
      source: 'unknown',
      attributes: {
        packageName: '@atlaskit/foo',
        packageVersion: '1.0.0',
        componentName: 'foo',
        fooBar: 'yay',
      },
    }),
  })(componentChannels[channel]);

export const createTaggedComponentWithAnalytics = (
  channel: FabricChannel,
  tag: string,
) =>
  withAnalyticsEvents({
    onClick: createAndFireEvent(channel)({
      action: 'someAction',
      actionSubject: 'someComponent',
      eventType: 'ui',
      source: 'unknown',
      tags: [tag, 'foo'],
    }),
  })(componentChannels[channel]);

export const IncorrectEventType = (channel: FabricChannel) =>
  withAnalyticsEvents({
    onClick: createAndFireEvent(channel)({
      action: 'someAction',
      actionSubject: 'someComponent',
      eventType: 'unknown' as EventType,
      source: 'unknown',
    }),
  })(componentChannels[channel]);

export const createButtonWithAnalytics = (payload, channel: FabricChannel) =>
  withAnalyticsEvents({
    onClick: createAndFireEvent(channel)(payload),
  })(MyButton);
