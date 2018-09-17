import * as React from 'react';
import { MediaSingleLayout } from '../../schema';
import Wrapper from './styled';
import * as classnames from 'classnames';
import { validWidthModes, calcPxFromColumns } from './grid';

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
