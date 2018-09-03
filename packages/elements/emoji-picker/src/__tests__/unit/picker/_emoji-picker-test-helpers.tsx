import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { getEmojiResourcePromise, newEmojiRepository } from '../_test-data';
import EmojiPicker, { Props } from '../../../picker/EmojiPicker';
import EmojiPickerComponent from '../../../picker/EmojiPickerComponent';
import { waitUntil } from '@atlaskit/util-common-test';
import AkButton from '@atlaskit/button';
import * as commonStyles from '../../../common/styles';

import EmojiPickerEmojiRow from '../../../picker/EmojiPickerEmojiRow';
import CategorySelector from '../../../picker/CategorySelector';
import { Emoji, EmojiDescription, EmojiPreview } from '@atlaskit/emoji';
import EmojiPickerCategoryHeading from '../../../picker/EmojiPickerCategoryHeading';
import EmojiPickerList from '../../../picker/EmojiPickerList';
import EmojiPickerListSearch from '../../../picker/EmojiPickerListSearch';
import EmojiDeletePreview from '../../../common/EmojiDeletePreview';
import EmojiErrorMessage from '../../../common/EmojiErrorMessage';
import EmojiUploadPreview from '../../../common/EmojiUploadPreview';
import { CategoryDescriptionMap, CategoryGroupKey } from '../../../types';
import { hasSelector } from '@atlaskit/util-data-test';

export function setupPickerWithoutToneSelector(): Promise<
  ReactWrapper<any, any>
> {
  return setupPicker({
    emojiProvider: getEmojiResourcePromise(),
    hideToneSelector: true,
  });
}

export function setupPicker(
  props?: Props,
  config?,
): Promise<ReactWrapper<any, any>> {
  const pickerProps: Props = {
    ...props,
  } as Props;

  if (!props || !props.emojiProvider) {
    pickerProps.emojiProvider = getEmojiResourcePromise(config);
  }

  const picker = mount(<EmojiPicker {...pickerProps} />);

  return waitUntil(() => hasSelector(picker, EmojiPickerComponent)).then(
    () => picker,
  );
}

export const leftClick = {
  button: 0,
};

export const allEmojis = newEmojiRepository().all().emojis;

export const findEmoji = list => list.find(Emoji);
/**
 * @param picker mounted EmojiPicker component
 * @param list child EmojiPickerList
 */
export const emojisVisible = (picker, list) => hasSelector(picker, Emoji, list);
const nodeIsCategory = (category: CategoryGroupKey, n) =>
  n.is(EmojiPickerCategoryHeading) && n.prop('id') === category;

export const findCategoryHeading = (category: CategoryGroupKey, component) =>
  component
    .find(EmojiPickerCategoryHeading)
    .filterWhere(n => nodeIsCategory(category, n));

const findAllVirtualRows = component =>
  component.update() &&
  component.findWhere(
    n =>
      n.is(EmojiPickerListSearch) ||
      n.is(EmojiPickerCategoryHeading) ||
      n.is(EmojiPickerEmojiRow),
    // ignore spinner
  );
// @ts-ignore
export const emojiRowsVisibleInCategory = (
  // @ts-ignore
  category: CategoryGroupKey,
  component,
) => {
  component.update();
  const rows = findAllVirtualRows(component);
  let foundStart = false;
  let foundEnd = false;
  return rows.filterWhere(n => {
    if (foundEnd) {
      return false;
    }

    if (foundStart) {
      if (!n.is(EmojiPickerEmojiRow)) {
        foundEnd = true;
        return false;
      }
      return true;
    }

    if (nodeIsCategory(category, n)) {
      foundStart = true;
    }

    return false;
  });
};

const getCategoryButton = (category: CategoryGroupKey, picker) => {
  const categorySelector = picker.find(CategorySelector);
  return categorySelector.findWhere(
    n =>
      n.name() === 'button' &&
      n.prop('title').toLocaleLowerCase() ===
        CategoryDescriptionMap[category]!.name.toLocaleLowerCase(),
  );
};

export const categoryVisible = (category: CategoryGroupKey, component) =>
  findCategoryHeading(category, component).length > 0;

export const showCategory = (
  category: CategoryGroupKey,
  component,
  categoryTitle?: string,
): Promise<any> => {
  const categoryButton = getCategoryButton(category, component);
  expect(categoryButton).toHaveLength(1);

  const list = component.find(EmojiPickerList);
  return waitUntil(() => emojisVisible(component, list)).then(() => {
    categoryButton.simulate('click', leftClick);
    return waitUntil(
      () =>
        component.update() &&
        categoryVisible(category, component.find(EmojiPickerList)),
    );
  });
};

export const findEmojiInCategory = (
  emojis,
  categoryId: CategoryGroupKey,
): EmojiDescription | undefined => {
  const upperCategoryId = categoryId.toLocaleUpperCase();
  for (let i = 0; i < emojis.length; i++) {
    const emoji = emojis.at(i).prop('emoji');
    if (emoji.category === upperCategoryId) {
      return emoji;
    }
  }
  return undefined;
};

export const findHandEmoji = (emojis): number => {
  let offset = -1;
  emojis.forEach((emoji, index) => {
    if (emoji.prop('emoji').shortName.indexOf(':raised_hand:') !== -1) {
      offset = index;
      return;
    }
  });
  return offset;
};

export const findSearchInput = component =>
  component.update() &&
  component
    .find(EmojiPickerListSearch)
    .findWhere(component => component.name() === 'input');

export const searchInputVisible = component =>
  findSearchInput(component).length > 0;

export const findEmojiNameInput = component =>
  component.update() &&
  component.find(`.${commonStyles.uploadChooseFileEmojiName} input`);

export const emojiNameInputVisible = (component): boolean =>
  findEmojiNameInput(component).length > 0;

export const emojiNameInputHasAValue = (component): boolean =>
  emojiNameInputVisible(component) &&
  findEmojiNameInput(component).prop('value');

export const uploadAddRowSelector = `.${commonStyles.uploadAddRow}`;

export const findAddEmojiButton = component =>
  component.update() &&
  component
    .find(uploadAddRowSelector)
    .find(AkButton)
    .at(0);

export const addEmojiButtonVisible = component =>
  component.update() && findAddEmojiButton(component).length > 0;

export const findCancelLink = component =>
  component.update() &&
  component
    .find(uploadAddRowSelector)
    .find(AkButton)
    .at(1);

export const findUploadPreview = component =>
  component.update() && component.find(EmojiUploadPreview);

export const findEmojiWithId = (component, id) =>
  component.update() &&
  component
    .find(EmojiPickerList)
    .find(Emoji)
    .filterWhere(emoji => emoji.prop('emoji').id === id);

export const emojiWithIdVisible = (component, id) =>
  findEmojiWithId(component, id).length > 0;

export const finishDelete = component =>
  component.update() && component.find(EmojiDeletePreview).length === 0;

export const errorMessageVisible = component =>
  component.update() && component.find(EmojiErrorMessage).length === 1;

export const findPreview = component => component.update().find(EmojiPreview);

export const previewVisible = component => findPreview(component).length > 0;