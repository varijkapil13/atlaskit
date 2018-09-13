import * as React from 'react';
import styled, { css } from 'styled-components';
// @ts-ignore: unused variable
// prettier-ignore
import { HTMLAttributes, ClassAttributes } from 'react';
import { MediaSingleLayout } from '../../schema';
import {
  akEditorFullPageMaxWidth,
  akEditorWideLayoutWidth,
  akEditorBreakoutPadding,
} from '../../styles';
import { calcMediaWidth } from '.';

export function floatMediaSingle(layout: MediaSingleLayout): string {
  switch (layout) {
    case 'wrap-right':
      return 'right';
    case 'wrap-left':
      return 'left';
    default:
      return 'none';
  }
}

export function calcMediaSingleWidth(
  layout: MediaSingleLayout,
  width: number,
  containerWidth?: number,
  columnSpan?: number,
): string {
  switch (layout) {
    case 'wrap-right':
    case 'wrap-left':
      return width > akEditorFullPageMaxWidth / 2 && !columnSpan
        ? 'calc(50% - 12px)'
        : `${width}px`;
    case 'wide':
      return width < akEditorWideLayoutWidth && !columnSpan
        ? '100%'
        : `${Math.min(akEditorWideLayoutWidth, width)}px`;
    case 'full-width':
      return `${Math.min(width, containerWidth || 0) -
        akEditorBreakoutPadding}px`;
    default:
      return width > akEditorFullPageMaxWidth - 12 * 2
        ? `${akEditorFullPageMaxWidth - 12 * 2}px`
        : `${width}px`;
  }
}

export function calcMediaSingleMaxWidth(
  layout: MediaSingleLayout,
  width: number,
  containerWidth: number,
) {
  switch (layout) {
    case 'wide':
    case 'full-width':
      return containerWidth < akEditorFullPageMaxWidth
        ? '100%'
        : `${containerWidth}px`;
    default:
      return '100%';
  }
}

export function marginMediaSingle(layout: MediaSingleLayout): string {
  switch (layout) {
    case 'wrap-right':
      return '12px 12px 12px 24px';
    case 'wrap-left':
      return '12px 24px 12px 12px';
    default:
      return '24px auto';
  }
}

export interface WrapperProps {
  layout: MediaSingleLayout;
  width: number;
  height: number;
  containerWidth?: number;
  columnSpan?: number;
}

/**
 * Can't use `.attrs` to handle highly dynamic styles because we are still
 * supporting `styled-components` v1.
 */
const MediaSingleDimensionHelper = ({
  width,
  height,
  layout,
  containerWidth = 0,
  columnSpan = 0,
}: WrapperProps) => css`
  /*width: ${calcMediaSingleWidth(layout, containerWidth, columnSpan)};*/
  max-width: ${calcMediaSingleMaxWidth(layout, width, containerWidth)};
  /*float: ${floatMediaSingle(layout)};*/
  /*margin: ${marginMediaSingle(layout)};*/

  &::after {
    content: '';
    display: block;
    padding-bottom: ${height / width * 100}%;
  }

  tr & {
    max-width: 100%;
  }
`;

const Wrapper: React.ComponentClass<
  HTMLAttributes<{}> & WrapperProps
> = styled.div`
  ${MediaSingleDimensionHelper};
  position: relative;

  & > div {
    position: absolute;
    height: 100%;
  }
`;
Wrapper.displayName = 'WrapperMediaSingle';

export default Wrapper;
