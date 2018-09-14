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

const gutterSize = 24;
const gridWidth = 680 + gutterSize;

export const validResizeModes: MediaSingleLayout[] = [
  'center',
  'wide',
  'full-width',
];
export const validWidthModes: MediaSingleLayout[] = [
  'center',
  'wrap-left',
  'wrap-right',
];

export function calcPxFromColumns(
  columns: number,
  containerWidth: number,
  gridSize: number,
): number {
  return Math.floor(
    (containerWidth > gridWidth ? gridWidth : containerWidth) /
      gridSize *
      columns -
      gutterSize,
  );
}

export function calcColumnsFromPx(
  width: number,
  containerWidth: number,
  gridSize: number,
): number {
  return Math.ceil(
    (width + gutterSize) *
      gridSize /
      (containerWidth > gridWidth ? gridWidth : containerWidth),
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
    columns && gridSize && validWidthModes.indexOf(layout) > -1
      ? calcPxFromColumns(columns, containerWidth, gridSize)
      : width;

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
