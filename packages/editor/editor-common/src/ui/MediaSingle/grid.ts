import { MediaSingleLayout } from '../../schema';
import { EditorAppearance } from '../../../../editor-core/src/types';

const handleMargin = 12;
const gutterSize = handleMargin * 2;
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

// comment editor:
// 16px margin on all 4 sides (on .ak-editor-content-area)
// 20px on left-right  (on .ProseMirror)
// we only care about the .ProseMirror margins

export function calcPxFromColumns(
  columns: number,
  containerWidth: number,
  gridSize: number,
  appearance: EditorAppearance,
): number {
  const gridWidth =
    appearance === 'full-page' ? FULLPAGE_GRID_WIDTH : containerWidth - 16;
  const maxWidth =
    appearance === 'full-page'
      ? Math.min(containerWidth, gridWidth)
      : gridWidth;

  console.log('using max width', maxWidth);

  return maxWidth / gridSize * columns - gutterSize;
}

export function calcColumnsFromPx(
  width: number,
  containerWidth: number,
  gridSize: number,
  appearance: EditorAppearance,
): number {
  const gridWidth =
    appearance === 'full-page'
      ? FULLPAGE_GRID_WIDTH
      : containerWidth - 16 /* (20 - 12) * 2 */;
  const maxWidth =
    appearance === 'full-page'
      ? Math.min(containerWidth, gridWidth)
      : gridWidth;

  return (width + gutterSize) * gridSize / maxWidth;
}

export function calcPxFromPct(
  pct: number,
  containerWidth: number,
  gridSize: number,
  appearance: EditorAppearance,
): number {
  const gridWidth =
    appearance === 'full-page'
      ? FULLPAGE_GRID_WIDTH
      : containerWidth - 16 /* (20 - 12) * 2 */;
  const maxWidth =
    appearance === 'full-page'
      ? Math.min(containerWidth, gridWidth)
      : gridWidth;

  return maxWidth * pct - gutterSize;
}

export function calcPctFromPx(
  width: number,
  containerWidth: number,
  gridSize: number,
  appearance: EditorAppearance,
): number {
  const gridWidth =
    appearance === 'full-page'
      ? FULLPAGE_GRID_WIDTH
      : containerWidth - 16 /* (20 - 12) * 2 */;
  const maxWidth =
    appearance === 'full-page'
      ? Math.min(containerWidth, gridWidth)
      : gridWidth;

  const res = (width + gutterSize) / maxWidth;
  console.log('using', width, 'got', res);

  return res;
}

export const snapToGrid = (
  gridWidth,
  width,
  height,
  gridSize,
  containerWidth,
  appearance,
) => {
  const pxWidth = calcPxFromPct(
    gridWidth,
    containerWidth,
    gridSize,
    appearance,
  );
  const columnSpan = Math.round(
    calcColumnsFromPx(pxWidth, containerWidth, gridSize, appearance),
  );
  const alignedWidth = calcPxFromColumns(
    columnSpan,
    containerWidth,
    gridSize,
    appearance,
  );

  const dim = {
    height: height / width * alignedWidth,
    width: alignedWidth,
  };

  console.log(
    'calculated dimensions',
    dim,
    'given height',
    height,
    'width',
    width,
  );
  return dim;
};
