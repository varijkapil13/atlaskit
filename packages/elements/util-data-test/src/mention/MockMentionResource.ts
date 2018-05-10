import { Search } from 'js-search';

import {
  MentionDescription,
  MentionsResult,
  AbstractMentionResource,
} from '@atlaskit/mention';
import debug from '../logger';
import { mentionResult } from './mention-data';
import { HttpError } from './utils';

const search = new Search('id');
search.addIndex('name');
search.addIndex('mentionName');
search.addIndex('nickname');

search.addDocuments(mentionResult);

export interface MockMentionConfig {
  minWait?: number;
  maxWait?: number;
}

export class MockMentionResource extends AbstractMentionResource {
  private config: MockMentionConfig;
  private lastReturnedSearch: number;

  constructor(config: MockMentionConfig) {
    super();

    this.config = config;
    this.lastReturnedSearch = 0;
  }

  filter(query: string): void {
    const searchTime = Date.now();
    const notify = (mentions: MentionsResult) => {
      if (searchTime >= this.lastReturnedSearch) {
        this.lastReturnedSearch = searchTime;
        this._notifyListeners(mentions);
      } else {
        const date = new Date(searchTime).toISOString().substr(17, 6);
        debug('Stale search result, skipping', date, query); // eslint-disable-line no-console, max-len
      }
      this._notifyAllResultsListeners(mentions);
    };

    const notifyErrors = error => {
      this._notifyErrorListeners(error);
    };

    const minWait = this.config.minWait || 0;
    const randomTime = (this.config.maxWait || 0) - minWait;
    const waitTime = Math.random() * randomTime + minWait;
    setTimeout(() => {
      let mentions;
      if (query === 'error') {
        notifyErrors('mock-error');
        return;
      } else if (query === '401' || query === '403') {
        notifyErrors(new HttpError(parseInt(query, 10), 'get off my lawn'));
      } else if (query) {
        mentions = search.search(query);
      } else {
        mentions = mentionResult;
      }
      notify({
        mentions,
        query,
      });
    }, waitTime + 1);
  }

  shouldHighlightMention(mention: MentionDescription) {
    return mention.id === 'highlight';
  }

  // eslint-disable-next-line class-methods-use-this
  recordMentionSelection(mention: MentionDescription): void {
    debug(`Record mention selection ${mention.id}`);
  }
}
