import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import Item, { ItemGroup, itemThemeNamespace } from '@atlaskit/item';
import { colors, themed } from '@atlaskit/theme';
import { TypeAheadItem } from '../types';

const itemTheme = {
  [itemThemeNamespace]: {
    padding: {
      default: {
        bottom: 8,
        left: 12,
        right: 12,
        top: 8,
      },
    },
    borderRadius: () => 0,
    selected: {
      background: themed({ light: colors.N20, dark: colors.DN70 }),
      text: themed({ light: colors.N800, dark: colors.DN600 }),
      secondaryText: themed({ light: colors.N200, dark: colors.DN300 }),
    },
  },
};

export type TypeAheadItemsListProps = {
  items?: Array<TypeAheadItem>;
  currentIndex: number;
  insertByIndex: (index: number) => void;
};

export function TypeAheadItemsList({
  items,
  currentIndex,
  insertByIndex,
}: TypeAheadItemsListProps) {
  if (!Array.isArray(items)) {
    return null;
  }

  return (
    <ThemeProvider theme={itemTheme}>
      <ItemGroup>
        {items.map((item, index) => (
          <Item
            key={item.title}
            onClick={() => insertByIndex(index)}
            elemBefore={item.icon ? item.icon() : null}
            isSelected={index === currentIndex}
          >
            {item.title}
          </Item>
        ))}
      </ItemGroup>
    </ThemeProvider>
  );
}
