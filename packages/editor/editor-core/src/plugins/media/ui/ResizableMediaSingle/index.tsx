import * as React from 'react';
import {
  MediaSingleProps,
  akEditorWideLayoutWidth,
  MediaSingleResizeModes,
  calcPxFromColumns,
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
import { calcPctFromPx } from '../../../../../../editor-common/src/ui/MediaSingle/grid';

type Props = MediaSingleProps & {
  updateSize: (width: number | null, layout: MediaSingleLayout) => void;
  displayGrid: (show: boolean) => void;
  getPos: () => number | undefined;
  state: EditorState;
  appearance: EditorAppearance;
  gridSize: number;
};

type State = {
  isResizing: boolean;
  selected: boolean;
};

export default class ResizableMediaSingle extends React.Component<
  Props,
  State
> {
  resizable: Resizable | null;

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
    const newSize = this.calcNewSize(newWidth);
    if (newSize.layout !== this.props.layout) {
      this.props.updateSize(newSize.width, newSize.layout);
    }
  };

  state = {
    isResizing: false,
    selected: false,
  };

  calcNewSize = newWidth => {
    // size at full size
    const maxWidth = calcPxFromColumns(
      6,
      this.props.containerWidth || this.props.width,
      6,
      this.props.appearance,
    );

    if (newWidth <= maxWidth) {
      let newLayout: MediaSingleLayout;
      if (
        this.props.layout === 'wrap-left' ||
        this.props.layout === 'wrap-right'
      ) {
        newLayout = this.props.layout;
      } else {
        newLayout = 'center';
      }

      return {
        width: calcPctFromPx(
          newWidth,
          this.props.containerWidth || 0,
          this.props.gridSize,
          this.props.appearance,
        ),
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
    const newSize = this.calcNewSize(newWidth);
    this.props.updateSize(newSize.width, newSize.layout);
  };

  setResizableRef = ref => {
    this.resizable = ref;
  };

  render() {
    const pos = this.props.getPos();
    if (!pos) {
      return;
    }

    const $pos = this.props.state.doc.resolve(pos);
    const supportsLayouts = $pos.parent.type.name === 'doc';

    const x: number[] = [];
    const gridBase =
      this.props.layout === 'wrap-left' || this.props.layout === 'wrap-right'
        ? this.props.gridSize
        : this.props.gridSize / 2;

    const parentLayout = findParentNodeOfTypeClosestToPos(
      $pos,
      this.props.state.schema.nodes.layoutSection,
    );

    // FIXME: not exhaustive, but we're changing layouts anyway
    const nodeGridWidth = parentLayout
      ? (parentLayout.node.attrs.layoutType as LayoutSectionLayoutType) ===
        'two_equal'
        ? this.props.gridSize / 2
        : this.props.gridSize / 3
      : this.props.gridSize;
    const gridWidth =
      this.props.layout === 'wrap-left' || this.props.layout === 'wrap-right'
        ? nodeGridWidth
        : nodeGridWidth / 2;

    // add grid snap points
    for (let i = 0; i <= gridWidth; i++) {
      x.push(
        calcPxFromColumns(
          i,
          this.props.containerWidth || this.props.width,
          gridBase,
          this.props.appearance,
        ),
      );
    }

    // FIXME: for these, we want extra styling on the resizer so that we apply the correct margins
    if (supportsLayouts && this.props.appearance === 'full-page') {
      x.push(akEditorWideLayoutWidth);
      if (
        this.props.containerWidth &&
        this.props.width >= this.props.containerWidth
      ) {
        // FIXME: padding from container?
        // x.push(this.props.containerWidth - 96);
        x.push(akEditorWideLayoutWidth + 120);
      }
    }

    const snap = {
      x,
    };

    const handles = {
      right: 'mediaSingle-resize-handle-right',
      left: 'mediaSingle-resize-handle-left',
    };

    // FIXME: ideally Resizable would let you pass in the component rather than
    // the div. For now, we just apply the same styles using CSS
    return (
      <Wrapper
        width={this.props.width}
        height={this.props.height}
        layout={this.props.layout}
        containerWidth={this.props.containerWidth || this.props.width}
      >
        <Resizable
          ref={this.setResizableRef}
          onResize={this.handleResize}
          size={{
            width: this.props.width,
          }}
          className={classnames(
            'media-single',
            this.props.layout,
            this.props.className,
            {
              'is-loading': this.props.isLoading,
              'is-resizing': this.state.isResizing,
              'mediaSingle-selected': this.state.selected,
              'media-wrapped':
                this.props.layout === 'wrap-left' ||
                this.props.layout === 'wrap-right',
            },
          )}
          snap={snap}
          handleWrapperClass={'mediaSingle-resize-wrapper'}
          handleClasses={handles}
          handleStyles={{
            right: {
              width: '24px',
              right: '-14px',
              zIndex: 99,
            },
            left: {
              width: '24px',
              left: '-14px',
              zIndex: 99,
            },
          }}
          enable={{
            left:
              MediaSingleResizeModes.concat('wrap-right').indexOf(
                this.props.layout,
              ) > -1,
            right:
              MediaSingleResizeModes.concat('wrap-left').indexOf(
                this.props.layout,
              ) > -1,
          }}
          onResizeStop={this.handleResizeStop}
          onResizeStart={this.handleResizeStart}
        >
          {React.cloneElement(React.Children.only(this.props.children), {
            onSelection: selected => {
              this.setState({ selected });
            },
          })}
        </Resizable>
      </Wrapper>
    );
  }
}
