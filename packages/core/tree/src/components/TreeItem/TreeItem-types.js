//@flow
import * as React from 'react';
import {
  type DraggableStateSnapshot,
  type DragHandleProps,
  type DraggingStyle,
  type DraggableProvided,
  type NotDraggingStyle,
} from 'react-beautiful-dnd';
import type { ItemId, Path, TreeItem } from '../../types';

export type TreeDraggingStyle = {|
  ...DraggingStyle,
  transition: string,
|};

type TreeDraggableStyle = NotDraggingStyle | TreeDraggingStyle;

type TreeDraggableProps = {|
  // Props that can be spread onto the element directly
  // inline style
  style: ?TreeDraggableStyle,
  // used for shared global styles
  'data-react-beautiful-dnd-draggable': string,
|};

export type RenderItemParams = {|
  item: TreeItem,
  depth: number,
  onExpand: (itemId: ItemId) => void,
  onCollapse: (itemId: ItemId) => void,
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot,
|};

export type TreeDraggableProvided = {|
  draggableProps: TreeDraggableProps,
  // will be null if the draggable is disabled
  dragHandleProps: ?DragHandleProps,
  // The following props will be removed once we move to react 16
  innerRef: (?HTMLElement) => void,
|};

export type Props = {|
  item: TreeItem,
  path: Path,
  onExpand: (itemId: ItemId, path: Path) => void,
  onCollapse: (itemId: ItemId, path: Path) => void,
  renderItem: RenderItemParams => React.Node,
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot,
|};
