import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import searchResults, { Props } from '../components/SearchResults';
import {
  AkNavigationItemGroup,
  quickSearchResultTypes,
} from '@atlaskit/navigation';
import { ResultType } from '../model/Result';

const { PersonResult, ObjectResult, ResultBase } = quickSearchResultTypes;

enum Group {
  Recent = 0,
  Jira = 1,
  Confluence = 2,
}

function findGroup(group: Group, wrapper: ShallowWrapper) {
  const groups = wrapper.find(AkNavigationItemGroup);
  const index = group.valueOf();
  return groups.at(index);
}

describe('SearchResults', () => {
  function render(partialProps: Partial<Props>) {
    const props = {
      query: '',
      recentlyViewedItems: [],
      recentResults: [],
      jiraResults: [],
      confluenceResults: [],
      ...partialProps,
    };

    return shallow(<div>{searchResults(props)}</div>);
  }

  it('should render recently viewed items when no query is entered', () => {
    const props = {
      query: '',
      recentlyViewedItems: [
        {
          type: ResultType.Object,
          name: 'name',
          containerName: 'container',
          href: 'href',
          avatarUrl: 'avatarUrl',
          resultId: 'rv1',
        },
      ],
    };

    const wrapper = render(props);
    const group = findGroup(Group.Recent, wrapper);

    expect(group.prop('title')).toEqual('Recently viewed');
    expect(group.find(ObjectResult).prop('name')).toEqual('name');
  });

  it('should only show the recently viewed group when no query is entered', () => {
    const props = {
      query: '',
      recentlyViewedItems: [
        {
          type: ResultType.Object,
          name: 'name',
          containerName: 'container',
          href: 'href',
          avatarUrl: 'avatarUrl',
          resultId: 'rv1',
        },
      ],
    };

    const wrapper = render(props);

    const groups = wrapper.find(AkNavigationItemGroup);
    expect(groups).toHaveLength(1);
  });

  it('should render recent results when there are results', () => {
    const props = {
      query: 'na',
      recentResults: [
        {
          type: ResultType.Object,
          name: 'name',
          containerName: 'container',
          href: 'href',
          avatarUrl: 'avatarUrl',
          resultId: 'r1',
        },
      ],
    };

    const wrapper = render(props);
    const group = findGroup(Group.Recent, wrapper);

    expect(group.prop('title')).toEqual('Recently viewed');
    expect(group.find(ObjectResult).prop('name')).toEqual('name');
  });

  it('should render jira results when there are results', () => {
    const props = {
      query: 'na',
      jiraResults: [
        {
          type: ResultType.Object,
          name: 'name',
          containerName: 'container',
          href: 'href',
          avatarUrl: 'avatarUrl',
          resultId: 'j1',
        },
      ],
    };

    const wrapper = render(props);
    const group = findGroup(Group.Jira, wrapper);

    expect(group.prop('title')).toEqual('Jira issues');
    expect(group.find(ObjectResult).prop('name')).toEqual('name');
  });

  it('should render confluence results when there are results', () => {
    const props = {
      query: 'na',
      confluenceResults: [
        {
          type: ResultType.Object,
          name: 'name',
          containerName: 'container',
          href: 'href',
          avatarUrl: 'avatarUrl',
          resultId: 'c1',
        },
      ],
    };

    const wrapper = render(props);
    const group = findGroup(Group.Confluence, wrapper);

    expect(group.prop('title')).toEqual('Confluence pages and blogs');
    expect(group.find(ObjectResult).prop('name')).toEqual('name');
  });

  it('should render a jira result item to search jira', () => {
    const props = {
      query: 'na',
    };

    const wrapper = render(props);
    const group = findGroup(Group.Jira, wrapper);

    expect(group.prop('title')).toEqual('Jira issues');
    expect(group.find(ResultBase).prop('resultId')).toEqual('search_jira');
  });

  it('should render a confluence result item to search confluence', () => {
    const props = {
      query: 'na',
    };

    const wrapper = render(props);
    const group = findGroup(Group.Confluence, wrapper);

    expect(group.prop('title')).toEqual('Confluence pages and blogs');
    expect(group.find(ResultBase).prop('resultId')).toEqual(
      'search_confluence',
    );
  });

  it('should only render result types that it understands', () => {
    const props = {
      query: '',
      recentlyViewedItems: [
        {
          type: 'unknown' as ResultType,
          name: 'name',
          containerName: 'container',
          href: 'href',
          avatarUrl: 'avatarUrl',
          resultId: 'rv1',
        },
      ],
    };

    const wrapper = render(props);
    const groups = wrapper.find(AkNavigationItemGroup);

    expect(groups).toHaveLength(1);
    expect(groups.at(0).prop('title')).toEqual('Recently viewed');
    expect(groups.at(0).find(ResultBase)).toHaveLength(0);
  });
});
