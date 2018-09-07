// @flow

import React, {
  PureComponent,
  type Element as ReactElement,
  type ComponentType,
} from 'react';
import { css } from 'emotion';

import { styleReducerNoOp, withContentTheme } from '../../theme';
import type { ItemProps } from './types';

type SwitchProps = {
  as: ReactElement<'a' | 'button' | 'div' | ComponentType>,
};
const ComponentSwitch = ({ as: ElementOrComponent, ...props }: SwitchProps) => (
  <ElementOrComponent {...props} />
);

class ItemPrimitive extends PureComponent<ItemProps> {
  static defaultProps = {
    isActive: false,
    isHover: false,
    isSelected: false,
    spacing: 'default',
    styles: styleReducerNoOp,
    text: '',
  };
  render() {
    // const { ItemBase } = this;
    const {
      after: After,
      before: Before,
      styles: styleReducer,
      isActive,
      isDragging,
      isHover,
      isSelected,
      spacing,
      subText,
      text,
      theme,
      component: CustomComponent,
      href,
      onClick,
      target,
    } = this.props;

    const { mode, context } = theme;
    const presentationProps = {
      isActive,
      isDragging,
      isHover,
      isSelected,
      spacing,
    };
    const defaultStyles = mode.item(presentationProps)[context];
    const styles = styleReducer(defaultStyles, presentationProps, theme);

    // base element switch

    let itemComponent = 'div';
    let itemProps = {};

    if (CustomComponent) {
      itemComponent = CustomComponent;
      itemProps = this.props;
    } else if (href) {
      itemComponent = 'a';
      itemProps = { href, onClick, target };
    } else if (onClick) {
      itemComponent = 'button';
      itemProps = { onClick };
    }

    return (
      <ComponentSwitch
        as={itemComponent}
        className={css({ '&&': styles.itemBase })}
        {...itemProps}
      >
        {!!Before && (
          <div css={styles.beforeWrapper}>
            <Before {...presentationProps} />
          </div>
        )}
        <div css={styles.contentWrapper}>
          <div css={styles.textWrapper}>{text}</div>
          {!!subText && <div css={styles.subTextWrapper}>{subText}</div>}
        </div>
        {!!After && (
          <div css={styles.afterWrapper}>
            <After {...presentationProps} />
          </div>
        )}
      </ComponentSwitch>
    );
  }
}

export default withContentTheme(ItemPrimitive);
