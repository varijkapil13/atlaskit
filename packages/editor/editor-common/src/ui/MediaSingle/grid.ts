import { MediaSingleLayout } from '../../schema';
import { EditorAppearance } from '../../../../editor-core/src/types';

const gutterSize = 24;
const FULLPAGE_GRID_WIDTH = 680 + gutterSize;

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
  appearance: EditorAppearance,
): number {
  const gridWidth =
    appearance === 'full-page' ? FULLPAGE_GRID_WIDTH : containerWidth - 40;
  const maxWidth =
    appearance === 'full-page'
      ? Math.min(containerWidth, gridWidth)
      : gridWidth;

  return Math.floor(maxWidth / gridSize * columns - gutterSize);
}

export function calcColumnsFromPx(
  width: number,
  containerWidth: number,
  gridSize: number,
  appearance: EditorAppearance,
): number {
  const gridWidth =
    appearance === 'full-page' ? FULLPAGE_GRID_WIDTH : containerWidth - 40;
  const maxWidth =
    appearance === 'full-page'
      ? Math.min(containerWidth, gridWidth)
      : gridWidth;

  return Math.ceil((width + gutterSize) * gridSize / maxWidth);
}
