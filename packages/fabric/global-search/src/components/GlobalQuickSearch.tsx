import * as React from 'react';
import * as debounce from 'lodash.debounce';
import { AkQuickSearch } from '@atlaskit/navigation';
import { Result } from '../model/Result';
import renderSearchResults from '../components/SearchResults';
import RecentSearchProvider from '../api/RecentSearchProvider';
import CrossProductSearchProvider from '../api/CrossProductSearchProvider';

export interface Props {
  recentSearchProvider: RecentSearchProvider;
  crossProductSearchProvider: CrossProductSearchProvider;
}

export interface State {
  isLoading: boolean;
  query: string;
  recentlyViewedItems: Result[];
  recentResults: Result[];
  jiraResults: Result[];
  confluenceResults: Result[];
}

export default class GlobalQuickSearch extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      query: '',
      recentlyViewedItems: [],
      recentResults: [],
      jiraResults: [],
      confluenceResults: [],
    };
  }

  async componentDidMount() {
    this.setState({
      recentlyViewedItems: await this.props.recentSearchProvider.getRecentItems(),
    });
  }

  handleSearch = ({ target }) => {
    const query = target.value;

    this.setState({
      query: query,
    });

    if (query.length < 2) {
      // reset search results so that internal state between query and results stays consistent
      this.setState({
        recentResults: [],
        jiraResults: [],
        confluenceResults: [],
      });

      return;
    }

    this.debouncedSearch(query);
  };

  doSearch = async (query: string) => {
    this.setState({
      isLoading: true,
    });

    const recentSearch = this.props.recentSearchProvider.search(query);
    const crossProductSearch = this.props.crossProductSearchProvider.search(
      query,
    );

    try {
      this.setState({
        recentResults: await recentSearch,
      });

      this.setState({
        jiraResults: (await crossProductSearch).jira,
        confluenceResults: (await crossProductSearch).confluence,
      });
    } catch (error) {
      // something bad happened. handle it. analytics
      // console.error('ERROR ERROR ERROR', error);
    } finally {
      this.setState({
        isLoading: false,
      });
    }
  };

  // leading so that we start searching as soon as the user typed in 2 characters since we don't search before that
  debouncedSearch = debounce(this.doSearch, 150, { leading: true });

  render() {
    const {
      query,
      isLoading,
      recentlyViewedItems,
      recentResults,
      jiraResults,
      confluenceResults,
    } = this.state;

    return (
      <AkQuickSearch
        isLoading={isLoading}
        onSearchInput={this.handleSearch}
        value={query}
      >
        {renderSearchResults({
          query,
          recentlyViewedItems,
          recentResults,
          jiraResults,
          confluenceResults,
        })}
      </AkQuickSearch>
    );
  }
}
