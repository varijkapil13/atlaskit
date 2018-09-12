import { MockReactionsAdapter, ReactionStore } from '@atlaskit/reactions';
import * as React from 'react';
import { Demo } from '../example-helpers/DemoPage';
import { MOCK_USERS } from '../example-helpers/MockData';
import {
  getDataProviderFactory,
  MockProvider as ConversationResource,
} from '../example-helpers/MockProvider';

const provider = new ConversationResource({
  url: 'http://localhost:8080',
  user: MOCK_USERS[0],
});

const reactionAdapter = new MockReactionsAdapter();

export default function Example() {
  return (
    <ReactionStore adapter={reactionAdapter}>
      <Demo provider={provider} dataProviders={getDataProviderFactory()} />
    </ReactionStore>
  );
}
