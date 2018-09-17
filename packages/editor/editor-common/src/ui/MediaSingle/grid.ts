import { MediaSingleLayout } from '../../schema';

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
