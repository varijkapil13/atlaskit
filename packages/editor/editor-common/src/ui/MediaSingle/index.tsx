import * as React from 'react';
import { MediaSingleLayout } from '../../schema';
import Wrapper from './styled';
import * as classnames from 'classnames';

export interface Props {
  children: React.ReactChild;
  layout: MediaSingleLayout;
  width: number;
  height: number;
  containerWidth?: number;
  isLoading?: boolean;
  className?: string;
  columns?: number;
  gridSize: number;
}

export function calcMediaWidth(
  columns: number,
  containerWidth: number,
  gridSize: number,
): number {
  const fullPagePadding = 32 * 2;
  const innerWidthOfContainer = containerWidth - fullPagePadding;
  return Math.floor(
    (containerWidth > 680 ? 680 : innerWidthOfContainer) / gridSize * columns -
      24,
  );
}

export function calcMediaColumns(
  width: number,
  containerWidth: number,
  gridSize: number,
): number {
  const fullPagePadding = 32 * 2;
  const innerWidthOfContainer = containerWidth - fullPagePadding;
  return Math.ceil(
    (width + 24) *
      gridSize /
      (containerWidth > 680 ? 680 : innerWidthOfContainer),
  );
}

export default function MediaSingle({
  children,
  layout,
  width,
  height,
  containerWidth = width,
  isLoading = false,
  className,
  columns,
  gridSize,
}: Props) {
  const mediaWidth =
    columns &&
    gridSize &&
    (layout === 'center' || layout === 'wrap-left' || layout === 'wrap-right')
      ? calcMediaWidth(columns, containerWidth, gridSize)
      : width;

  console.log('mediaWidth', mediaWidth, 'columns', columns);

  return (
    <Wrapper
      layout={layout}
      width={mediaWidth}
      height={columns && gridSize ? height / (width / mediaWidth) : height}
      columnSpan={columns}
      containerWidth={containerWidth}
      className={classnames('media-single', layout, className, {
        'is-loading': isLoading,
        'media-wrapped': layout === 'wrap-left' || layout === 'wrap-right',
      })}
    >
      {React.Children.only(children)}
    </Wrapper>
  );
}
