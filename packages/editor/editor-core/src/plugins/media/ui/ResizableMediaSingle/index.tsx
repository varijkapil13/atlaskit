import * as React from 'react';
import {
  MediaSingleProps,
  akEditorWideLayoutWidth,
  MediaSingleResizeModes,
  calcPxFromColumns,
  calcPctFromPx,
  snapToGrid,
  calcMediaSingleWidth,
} from '@atlaskit/editor-common';
import {
  default as Resizable,
  ResizableDirection,
  NumberSize,
} from 're-resizable';
import * as classnames from 'classnames';
import { MediaSingleLayout } from '@atlaskit/editor-common';
import { EditorState } from 'prosemirror-state';
import { findParentNodeOfTypeClosestToPos } from 'prosemirror-utils';
import { LayoutSectionLayoutType } from '../../../../../../editor-common/src/schema/nodes/layout-section';
import { Wrapper } from './styled';
import { EditorAppearance } from '../../../../types';

type EnabledHandles = { left?: boolean; right?: boolean };

type Props = MediaSingleProps & {
  updateSize: (width: number | null, layout: MediaSingleLayout) => void;
  displayGrid: (show: boolean) => void;
  getPos: () => number | undefined;
  state: EditorState;
  appearance: EditorAppearance;
  gridSize: number;
  containerWidth: number;
};

const handleSides = ['left', 'right'];

class Resizer extends React.Component<
  Props & {
    selected: boolean;
    enable: EnabledHandles;
    calcNewSize: (
      newWidth: number,
    ) => { layout: MediaSingleLayout; width: number | null };
    snapPoints: number[];
    mediaSingleWidth: string;
  },
  { isResizing: boolean }
> {
  resizable: Resizable | null;
  state = {
    isResizing: false,
  };

  handleResizeStart = () => {
    this.setState({ isResizing: true });
    this.props.displayGrid(true);
  };

  handleResize = (
    event: MouseEvent | TouchEvent,
    direction: ResizableDirection,
    elementRef: HTMLDivElement,
    delta: NumberSize,
  ) => {
    if (!this.resizable || !this.resizable.state.original) {
      return;
    }

    const newWidth = this.resizable.state.original.width + delta.width;
    const newSize = this.props.calcNewSize(newWidth);
    if (newSize.layout !== this.props.layout) {
      this.props.updateSize(newSize.width, newSize.layout);
    }
  };

  handleResizeStop = (
    event,
    direction,
    refToElement,
    delta: { width: number; height: number },
  ) => {
    this.props.displayGrid(false);
    this.setState({ isResizing: false });

    if (!this.resizable) {
      return;
    }

    if (!this.resizable.state.original) {
      return;
    }

    const newWidth = this.resizable.state.original.width + delta.width;
    const newSize = this.props.calcNewSize(newWidth);
    this.props.updateSize(newSize.width, newSize.layout);
  };

  setResizableRef = ref => {
    this.resizable = ref;
  };

  render() {
    const handleStyles = {};
    const handles = {};
    handleSides.forEach(side => {
      handles[side] = `mediaSingle-resize-handle-${side}`;
      handleStyles[side] = {
        width: '24px',
        [side]: '-14px',
        zIndex: 99,
      };
    });

    // Ideally, Resizable would let you pass in the component rather than
    // the div. For now, we just apply the same styles using CSS
    return (
      <Resizable
        ref={this.setResizableRef}
        onResize={this.handleResize}
        size={{
          width: this.props.mediaSingleWidth,
        }}
        className={classnames(
          'media-single',
          this.props.layout,
          this.props.className,
          {
            'is-loading': this.props.isLoading,
            'is-resizing': this.state.isResizing,
            'mediaSingle-selected': this.props.selected,
            'media-wrapped':
              this.props.layout === 'wrap-left' ||
              this.props.layout === 'wrap-right',
          },
        )}
        snap={{ x: this.props.snapPoints }}
        handleWrapperClass={'mediaSingle-resize-wrapper'}
        handleClasses={handles}
        handleStyles={handleStyles}
        enable={this.props.enable}
        onResizeStop={this.handleResizeStop}
        onResizeStart={this.handleResizeStart}
      >
        {this.props.children}
      </Resizable>
    );
  }
}

export default class ResizableMediaSingle extends React.Component<
  Props,
  { selected: boolean }
> {
  state = {
    selected: false,
  };

  calcNewSize = (newWidth: number) => {
    // size at full size (might be less than containerWidth since we
    // take into account margins and control padding)
    const { containerWidth, appearance, gridSize, layout } = this.props;

    const maxWidth = calcPxFromColumns(6, containerWidth, 6, appearance);

    if (newWidth <= maxWidth) {
      let newLayout: MediaSingleLayout;
      if (layout === 'wrap-left' || layout === 'wrap-right') {
        newLayout = layout;
      } else {
        newLayout = 'center';
      }

      return {
        width: calcPctFromPx(newWidth, containerWidth, gridSize, appearance),
        layout: newLayout,
      };
    } else {
      // wide or full-width
      const newLayout: MediaSingleLayout =
        newWidth <= akEditorWideLayoutWidth ? 'wide' : 'full-width';

      return {
        width: null,
        layout: newLayout,
      };
    }
  };

  get gridBase() {
    const { layout, gridSize } = this.props;
    return layout === 'wrap-left' || layout === 'wrap-right'
      ? gridSize
      : gridSize / 2;
  }

  get $pos() {
    const pos = this.props.getPos();
    if (typeof pos === 'undefined') {
      return null;
    }

    return this.props.state.doc.resolve(pos);
  }

  get gridSpan() {
    const { gridSize } = this.props;
    const $pos = this.$pos;
    if (!$pos) {
      return gridSize;
    }

    const parentLayout = findParentNodeOfTypeClosestToPos(
      $pos,
      this.props.state.schema.nodes.layoutSection,
    );

    if (parentLayout) {
      // we're inside a layout, so we can't resize to full page
      return (parentLayout.node.attrs.layoutType as LayoutSectionLayoutType) ===
        'two_equal'
        ? gridSize / 2
        : gridSize / 3;
    } else {
      return gridSize;
    }
  }

  /**
   * The maxmimum number of grid columns this node can resize to.
   */
  get gridWidth() {
    const { layout } = this.props;
    return layout === 'wrap-left' || layout === 'wrap-right'
      ? this.gridSpan
      : this.gridSpan / 2;
  }

  wrapper: HTMLElement | null;
  get snapPoints() {
    let offsetLeft = 0;
    if (this.wrapper && this.insideInlineLike) {
      let currentNode: HTMLElement | null = this.wrapper;
      while (
        currentNode &&
        currentNode.parentElement &&
        !currentNode.parentElement.classList.contains('ProseMirror') &&
        currentNode !== document.body
      ) {
        offsetLeft += currentNode.offsetLeft;
        currentNode = currentNode.parentElement;
      }

      offsetLeft -= (document.querySelector('.ProseMirror')! as HTMLElement)
        .offsetLeft;
      if (this.insideTable) {
        // table cell padding
        offsetLeft -= 10;
      }
    }

    const { appearance, containerWidth } = this.props;
    const snapPoints: number[] = [];
    for (let i = 0; i <= this.gridWidth; i++) {
      snapPoints.push(
        calcPxFromColumns(i, containerWidth, this.gridBase, appearance) -
          offsetLeft,
      );
    }

    const $pos = this.$pos;
    if (!$pos) {
      return snapPoints;
    }

    const isTopLevel = $pos.parent.type.name === 'doc';
    if (isTopLevel && appearance === 'full-page') {
      snapPoints.push(akEditorWideLayoutWidth);
      snapPoints.push(containerWidth - 128);
    }

    return snapPoints;
  }

  get insideInlineLike(): boolean {
    const $pos = this.$pos;
    if (!$pos) {
      return false;
    }

    const { table, listItem } = this.props.state.schema.nodes;
    return !!findParentNodeOfTypeClosestToPos($pos, [table, listItem]);
  }

  get insideTable(): boolean {
    const $pos = this.$pos;
    if (!$pos) {
      return false;
    }

    const { table } = this.props.state.schema.nodes;
    return !!findParentNodeOfTypeClosestToPos($pos, [table]);
  }

  render() {
    let width = this.props.width;
    let height = this.props.height;
    if (this.props.gridWidth) {
      const dimensions = snapToGrid(
        this.props.gridWidth,
        this.props.width,
        this.props.height,
        this.props.gridSize,
        this.props.containerWidth,
        this.props.appearance,
      );
      width = dimensions.width;
      height = dimensions.height;
    }

    const enable: EnabledHandles = {};
    handleSides.forEach(side => {
      const oppositeSide = side === 'left' ? 'right' : 'left';
      enable[side] =
        MediaSingleResizeModes.concat(
          `wrap-${oppositeSide}` as MediaSingleLayout,
        ).indexOf(this.props.layout) > -1;

      if (side === 'left' && this.insideInlineLike) {
        enable[side] = false;
      }
    });

    return (
      <Wrapper
        width={width}
        height={height}
        layout={this.props.layout}
        containerWidth={this.props.containerWidth || this.props.width}
        forceWidth={!!this.props.gridWidth}
        innerRef={elem => (this.wrapper = elem)}
      >
        <Resizer
          {...this.props}
          selected={this.state.selected}
          enable={enable}
          calcNewSize={this.calcNewSize}
          snapPoints={this.snapPoints}
          mediaSingleWidth={calcMediaSingleWidth(
            this.props.layout,
            width,
            this.props.containerWidth,
          )}
        >
          {React.cloneElement(React.Children.only(this.props.children), {
            onSelection: selected => {
              this.setState({ selected });
            },
          })}
        </Resizer>
      </Wrapper>
    );
  }
}
