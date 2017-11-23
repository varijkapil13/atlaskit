import * as React from 'react';
import { storyData as mentionStoryData } from '@atlaskit/mention/dist/es5/support';
import { storyData as emojiStoryData } from '@atlaskit/emoji/dist/es5/support';
import { MockActivityResource } from '@atlaskit/activity/dist/es5/support';
import Button from '@atlaskit/button';

import { Content, ButtonGroup } from './styles';
import imageUploadHandler from './imageUpload';

import { MentionResource } from '../src';
import { toJSON } from '../src/utils';
import { storyMediaProviderFactory } from '@atlaskit/editor-test-helpers';

const rejectedPromise = Promise.reject(new Error('Simulated provider rejection'));
const pendingPromise = new Promise<any>(() => { });

const providers = {
  mentionProvider: {
    resolved: Promise.resolve(mentionStoryData.resourceProvider),
    'resolved 2': Promise.resolve(new MentionResource({
      url: 'https://pf-mentions-service.staging.atlassian.io/mentions/f7ebe2c0-0309-4687-b913-41d422f2110b',
      containerId: 'b0d035bd-9b98-4386-863b-07286c34dc14',
      productId: 'hipchat'
    })),
    pending: pendingPromise,
    rejected: rejectedPromise,
    'undefined': undefined,
  },
  emojiProvider: {
    resolved: emojiStoryData.getEmojiResource({ uploadSupported: true }),
    pending: pendingPromise,
    rejected: rejectedPromise,
    'undefined': undefined,
  },
  mediaProvider: {
    resolved: storyMediaProviderFactory({ includeUserAuthProvider: true }),
    pending: pendingPromise,
    rejected: rejectedPromise,
    'view only': storyMediaProviderFactory({ includeUploadContext: false }),
    'w/o link cards': storyMediaProviderFactory({ includeLinkCreateContext: false }),
    'w/o userAuthProvider': storyMediaProviderFactory(),
    'undefined': undefined,
  },
  activityProvider: {
    resolved: new MockActivityResource(),
    pending: pendingPromise,
    rejected: rejectedPromise,
    'undefined': undefined,
  },
  imageUploadProvider: {
    resolved: Promise.resolve(imageUploadHandler),
    pending: pendingPromise,
    rejected: rejectedPromise,
    'undefined': undefined,
  }
};
rejectedPromise.catch(() => { });

interface State {
  editorEnabled: boolean;
  imageUploadProvider: string;
  mentionProvider: string;
  mediaProvider: string;
  emojiProvider: string;
  activityProvider: string;
  jsonDocument?: string;
}

export default class ToolsDrawer extends React.Component<any, State> {
  constructor(props) {
    super(props);

    this.state = {
      editorEnabled: true,
      imageUploadProvider: 'undefined',
      mentionProvider: 'resolved',
      mediaProvider: 'resolved',
      emojiProvider: 'resolved',
      activityProvider: 'resolved',
      jsonDocument: '{}',
    };
  }

  private switchProvider = (providerType, providerName) => {
    this.setState({ [providerType]: providerName });
  }

  private reloadEditor = () => {
    this.setState({ editorEnabled: false }, () => {
      this.setState({ editorEnabled: true });
    });
  }

  private onChange = editorView => {
    this.setState({
      jsonDocument: JSON.stringify(toJSON(editorView.state.doc), null, 2)
    });
  }

  render() {
    const { mentionProvider, emojiProvider, mediaProvider, activityProvider, imageUploadProvider, jsonDocument, editorEnabled } = this.state;
    return (
      <Content>
        {
          editorEnabled ?
            (this.props.renderEditor({
              imageUploadProvider: providers.imageUploadProvider[imageUploadProvider],
              mediaProvider: providers.mediaProvider[mediaProvider],
              mentionProvider: providers.mentionProvider[mentionProvider],
              emojiProvider: providers.emojiProvider[emojiProvider],
              activityProvider: providers.activityProvider[activityProvider],
              onChange: this.onChange
            })) :
            ''
        }
      </Content>
    );
  }
}