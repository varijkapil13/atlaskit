import * as React from 'react';
import { reactionsProvider } from '../src/mock-reactions-provider';
import { Reactions } from '../src';
import { emoji } from '@atlaskit/util-data-test';
import { EmojiProvider } from '@atlaskit/emoji';
import { ReactionsProvider } from '../src/reactions-resource';
import debug, { enableLogger } from '../src/util/logger';
import { AnalyticsListener } from '@atlaskit/analytics-next';

const { getEmojiResource } = emoji.storyData;
const demoAri = 'ari:cloud:owner:demo-cloud-id:item/1';
const containerAri = 'ari:cloud:owner:demo-cloud-id:container/1';

export default function Example() {
  enableLogger(true);
  return (
    <AnalyticsListener channel="fabric-elements" onEvent={console.log}>
      <div>
        <p>This is a message with some reactions</p>
        <Reactions
          containerAri={containerAri}
          ari={demoAri}
          emojiProvider={getEmojiResource() as Promise<EmojiProvider>}
          reactionsProvider={reactionsProvider as ReactionsProvider}
          onReactionClick={(emojiId: string): any => {
            debug('onReactionClick: ', emojiId);
            reactionsProvider.toggleReaction(containerAri, demoAri, emojiId);
          }}
          allowAllEmojis={true}
        />
      </div>
    </AnalyticsListener>
  );
}
