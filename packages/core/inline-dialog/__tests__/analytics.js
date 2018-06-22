// @flow
import {
  withAnalyticsEvents,
  withAnalyticsContext,
  createAndFireEvent,
} from '@atlaskit/analytics-next';
import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
import '../src/InlineDialog/index';

// This is a global mock for this file that will mock all components wrapped with analytics
// and replace them with an empty SFC that returns null. This includes components imported
// directly in this file and others imported as dependencies of those imports.
jest.mock('@atlaskit/analytics-next', () => ({
  withAnalyticsEvents: jest.fn(() => jest.fn(() => () => null)),
  withAnalyticsContext: jest.fn(() => jest.fn(() => () => null)),
  createAndFireEvent: jest.fn(() => jest.fn(args => args)),
}));

describe('InlineDialog', () => {
  it('should be wrapped with analytics context', () => {
    expect(withAnalyticsContext).toHaveBeenCalledWith({
      componentName: 'inlineDialog',
      packageName,
      packageVersion,
    });
  });

  it('should be wrapped with analytics events', () => {
    expect(createAndFireEvent).toHaveBeenCalledWith('atlaskit');
    expect(withAnalyticsEvents).toHaveBeenLastCalledWith({
      onContentBlur: {
        action: 'blurred',
        actionSubject: 'inlineDialog',
        attributes: {
          componentName: 'inlineDialog',
          packageName,
          packageVersion,
        },
      },
      onContentClick: {
        action: 'clicked',
        actionSubject: 'inlineDialog',
        attributes: {
          componentName: 'inlineDialog',
          packageName,
          packageVersion,
        },
      },
      onContentFocus: {
        action: 'focused',
        actionSubject: 'inlineDialog',
        attributes: {
          componentName: 'inlineDialog',
          packageName,
          packageVersion,
        },
      },
      onClose: {
        action: 'closed',
        actionSubject: 'inlineDialog',
        attributes: {
          componentName: 'inlineDialog',
          packageName,
          packageVersion,
        },
      },
    });
  });
});