// @flow
import React, { type ComponentType } from 'react';
import QuestionIcon from '@atlaskit/icon/glyph/question';
import Badge from '@atlaskit/badge';
import Avatar from '@atlaskit/avatar';
import Dropdown from '@atlaskit/dropdown-menu';
import type { GlobalNavigationProps } from '../components/GlobalNavigation/types';

// Remove items with no props passed from the product.
const removeEmptyItems = items =>
  Object.keys(items)
    .filter(item => Object.keys(items[item]).length)
    .reduce((acc, curr) => {
      acc[curr] = items[curr];
      return acc;
    }, {});

const generateDropDown = (
  Trigger: ComponentType<*>,
  DropdownItems: ComponentType<*>,
) => ({ className }: { className: string }) => (
  <Dropdown
    trigger={
      <span className={className}>
        <Trigger />
      </span>
    }
    position="right bottom"
    boundariesElement="window"
  >
    <DropdownItems />
  </Dropdown>
);

const generateAvatar = profileIconUrl => () => (
  <Avatar
    borderColor="transparent"
    src={profileIconUrl}
    isActive={false}
    isHover={false}
    size="small"
  />
);

export default function generateProductConfig(props: GlobalNavigationProps) {
  // Add key only if prop is passed.
  // Flow doesn't seem to understand the syntax
  // $FlowFixMe
  const product = {
    ...(props.productIcon && { icon: props.productIcon }),
    ...(props.onProductClick && { onClick: props.onProductClick }),
    ...(props.productTooltip && { tooltip: props.productTooltip }),
    ...(props.productTooltip && { label: props.productTooltip }),
  };
  // $FlowFixMe
  const create = {
    ...(props.onCreateClick && { onClick: props.onCreateClick }),
    ...(props.createTooltip && { tooltip: props.createTooltip }),
    ...(props.createTooltip && { label: props.createTooltip }),
  };
  // $FlowFixMe
  const search = {
    ...(props.onSearchClick && { onClick: props.onSearchClick }),
    ...(props.searchTooltip && { tooltip: props.searchTooltip }),
    ...(props.searchTooltip && { label: props.searchTooltip }),
  };
  // $FlowFixMe
  const yourWork = {
    ...(props.onYourWorkClick && { onClick: props.onYourWorkClick }),
    ...(props.yourWorkTooltip && { tooltip: props.yourWorkTooltip }),
    ...(props.yourWorkTooltip && { label: props.yourWorkTooltip }),
  };
  // $FlowFixMe
  const notification = {
    ...(props.onNotificationClick && { onClick: props.onNotificationClick }),
    ...(props.notificationTooltip && { tooltip: props.notificationTooltip }),
    ...(props.notificationTooltip && { label: props.notificationTooltip }),
    ...(props.notificationCount && {
      badge: ((notificationCount: number) => () => (
        <Badge appearance="important" value={notificationCount} />
      ))(props.notificationCount),
    }),
  };
  // $FlowFixMe
  const people = {
    ...(props.onPeopleClick && { onClick: props.onPeopleClick }),
    ...(props.peopleTooltip && { tooltip: props.peopleTooltip }),
    ...(props.peopleTooltip && { label: props.peopleTooltip }),
  };
  // $FlowFixMe
  const appSwitcher = {
    ...(props.onAppSwitcherClick && { onClick: props.onAppSwitcherClick }),
    ...(props.appSwitcherTooltip && { tooltip: props.appSwitcherTooltip }),
    ...(props.appSwitcherTooltip && { label: props.appSwitcherTooltip }),
    ...(props.appSwitcherComponent && {
      component: props.appSwitcherComponent,
    }),
  };
  // $FlowFixMe
  const help = {
    ...(props.onHelpClick && { onClick: props.onHelpClick }),
    ...(props.helpTooltip && { tooltip: props.helpTooltip }),
    ...(props.helpTooltip && { label: props.helpTooltip }),
    ...(props.helpItems && {
      component: (helpItems => generateDropDown(QuestionIcon, helpItems))(
        props.helpItems,
      ),
    }),
  };
  // $FlowFixMe
  const profile = {
    ...(props.onProfileClick && { onClick: props.onProfileClick }),
    ...(props.profileTooltip && { tooltip: props.profileTooltip }),
    ...(props.profileTooltip && { label: props.profileTooltip }),
    ...(props.profileItems && {
      component: (profileItems =>
        generateDropDown(generateAvatar(props.profileIconUrl), profileItems))(
        props.profileItems,
      ),
    }),
  };

  return removeEmptyItems({
    product,
    create,
    search,
    yourWork,
    notification,
    people,
    appSwitcher,
    help,
    profile,
  });
}