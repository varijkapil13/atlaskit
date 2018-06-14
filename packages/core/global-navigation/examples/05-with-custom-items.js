// @flow

import React from 'react';
import EmojiAtlassianIcon from '@atlaskit/icon/glyph/emoji/atlassian';
import TrayIcon from '@atlaskit/icon/glyph/tray';
import BitbucketBranchesIcon from '@atlaskit/icon/glyph/bitbucket/branches';
import { LayoutManager, NavigationProvider } from '@atlaskit/navigation-next';

import GlobalNavigation from '../src/components/GlobalNavigation';

const Global = () => (
  <GlobalNavigation
    product={{
      label: 'Jira',
      icon: EmojiAtlassianIcon,
    }}
    search={{}}
    create={{}}
    people={{}}
    notification={{}}
    appSwitcher={{}}
    help={{}}
    profile={{}}
    primaryActions={[
      {
        label: 'Your Work',
        tooltip: 'Your Work',
        icon: TrayIcon,
        size: 'small',
      },
    ]}
    secondaryActions={[
      {
        label: 'Ngrok Link',
        tooltip: 'Ngrok Link',
        icon: BitbucketBranchesIcon,
        size: 'small',
      },
    ]}
  />
);

export default () => (
  <NavigationProvider>
    <LayoutManager
      globalNavigation={Global}
      productRootNavigation={() => null}
      productContainerNavigation={() => null}
    >
      Page content
    </LayoutManager>
  </NavigationProvider>
);