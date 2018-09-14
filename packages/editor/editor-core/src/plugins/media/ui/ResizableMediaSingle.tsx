import * as React from 'react';
import {
  MediaSingleProps,
  akEditorWideLayoutWidth,
  akEditorFullPageMaxWidth,
} from '@atlaskit/editor-common';
import {
  default as Resizable,
  ResizableDirection,
  NumberSize,
} from 're-resizable';
import {
  calcMediaWidth,
  calcMediaColumns,
} from '../../../../../editor-common/src/ui/MediaSingle';
import {
  calcMediaSingleWidth,
  MediaSingleDimensionHelper,
} from '../../../../../editor-common/src/ui/MediaSingle/styled';
import * as classnames from 'classnames';
import styled from 'styled-components';
import { MediaSingleLayout } from '@atlaskit/editor-common';
import { EditorState } from 'prosemirror-state';
import { findParentNodeOfTypeClosestToPos } from 'prosemirror-utils';
import { LayoutSectionLayoutType } from '../../../../../editor-common/src/schema/nodes/layout-section';

type Props = MediaSingleProps & {
  updateSize: (columnSpan: number | null, layout: MediaSingleLayout) => void;
  displayGrid: (show: boolean) => void;
  // supportsLayouts: boolean;
  getPos: () => number | undefined;
  state: EditorState;
};

type State = {
  width: number;
  layout: MediaSingleLayout;
  columns?: number;
  isResizing: boolean;
  selected: boolean;
};

// TODO: use attrs
export interface WrapperProps {
  layout: MediaSingleLayout;
  width: number;
  height: number;
  containerWidth: number;
  columnSpan?: number;
}

const Wrapper: React.ComponentClass<
  React.HTMLAttributes<{}> & WrapperProps
> = styled.div`
  & > div > div {
    position: absolute;
    height: 100%;
  }

  & > div::after {
    content: '';
    display: block;
    padding-bottom: ${(r: WrapperProps) => r.height / r.width * 100}%;
  }

  & > div {
    ${MediaSingleDimensionHelper};
  }
`;

const validResizeModes: MediaSingleLayout[] = ['center', 'wide', 'full-width'];

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
    if (newSize.layout !== this.state.layout) {
      console.warn('setting state to', newSize.layout);
      this.setState({
        layout: newSize.layout,
        columns: newSize.columnSpan ? newSize.columnSpan : undefined,
      });
      this.props.updateSize(newSize.columnSpan, newSize.layout);
    }
  };

  calcWidth(props: Props) {
    if (
      props.columns &&
      (props.layout === 'center' ||
        props.layout === 'wrap-left' ||
        props.layout === 'wrap-right')
    ) {
      return calcMediaWidth(props.columns, props.width, props.gridSize);
    }

    if (props.layout === 'center') {
      return Math.min(
        this.props.containerWidth || this.props.width,
        akEditorFullPageMaxWidth,
      );
    }

    if (props.layout === 'wide') {
      return Math.min(
        this.props.containerWidth || this.props.width,
        akEditorWideLayoutWidth,
      );
    }

    return props.containerWidth || props.width;
  }

  state = {
    isResizing: false,
    width: this.calcWidth(this.props),
    layout: this.props.layout,
    columns: this.props.columns,
    selected: false,
  };

  componentWillReceiveProps(nextProps: Props) {
    const newWidth = this.calcWidth(nextProps);
    if (newWidth !== this.state.width) {
      console.log('setting new state', newWidth, 'from props', nextProps);
      this.setState({ width: newWidth });
    }

    if (
      nextProps.layout !== this.state.layout ||
      nextProps.columns !== this.state.columns
    ) {
      this.setState({ layout: nextProps.layout, columns: nextProps.columns });
    }
  }

  calcNewSize = newWidth => {
    // size at full size
    const maxWidth = calcMediaWidth(
      6,
      this.props.containerWidth || this.props.width,
      6,
    );
    if (newWidth <= maxWidth) {
      // would take up some columns, so define it a width using the grid
      const newColumns = calcMediaColumns(
        newWidth,
        this.props.containerWidth || this.props.width,
        12,
      );

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
        columnSpan: newColumns,
        layout: newLayout,
      };
    } else {
      // wide or full-width
      const newLayout: MediaSingleLayout =
        newWidth <= akEditorWideLayoutWidth ? 'wide' : 'full-width';

      return {
        columnSpan: null,
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
      console.error('no original state');
      return;
    }

    const newWidth = this.resizable.state.original.width + delta.width;
    console.log('new width', newWidth, 'delta', delta);
    // this.setState({width: newWidth});

    const newSize = this.calcNewSize(newWidth);
    this.props.updateSize(newSize.columnSpan, newSize.layout);
  };

  setResizableRef = ref => {
    this.resizable = ref;
  };

  render() {
    // TODO: calc snapping based on grid plugin

    const pos = this.props.getPos();
    if (!pos) {
      console.warn('no position but interacting?');
      return;
    }
    const $pos = this.props.state.doc.resolve(pos);
    const supportsLayouts = $pos.parent.type.name === 'doc';

    const x: number[] = [];
    const gridBase =
      this.props.layout === 'wrap-left' || this.props.layout === 'wrap-right'
        ? 12
        : 6;

    const parentLayout = findParentNodeOfTypeClosestToPos(
      $pos,
      this.props.state.schema.nodes.layoutSection,
    );

    // FIXME: not exhaustive (but we're changing layouts anyway)
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

    for (let i = 0; i <= gridWidth; i++) {
      x.push(
        calcMediaWidth(
          i,
          this.props.containerWidth || this.props.width,
          gridBase,
        ),
      );
    }

    // FIXME: for these, we want extra styling on the resizer so that we apply the correct margins
    if (supportsLayouts) {
      x.push(akEditorWideLayoutWidth - 24);
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

    console.log('re-render', this.props);

    const handles = {
      right: 'mediaSingle-resize-handle-right',
      left: 'mediaSingle-resize-handle-left',
    };

    return (
      <Wrapper
        width={this.props.width}
        height={this.props.height}
        layout={this.state.layout}
        containerWidth={this.props.containerWidth || this.props.width}
        columnSpan={this.props.columns}
      >
        <Resizable
          ref={this.setResizableRef}
          onResize={this.handleResize}
          size={{
            width: calcMediaSingleWidth(
              this.state.layout,
              this.state.width,
              this.props.containerWidth,
              this.state.columns,
            ),
          }}
          className={classnames(
            'media-single',
            this.state.layout,
            this.props.className,
            {
              'is-loading': this.props.isLoading,
              'is-resizing': this.state.isResizing,
              'mediaSingle-selected': this.state.selected,
              'media-wrapped':
                this.state.layout === 'wrap-left' ||
                this.state.layout === 'wrap-right',
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
              validResizeModes.concat('wrap-right').indexOf(this.props.layout) >
              -1,
            right:
              validResizeModes.concat('wrap-left').indexOf(this.props.layout) >
              -1,
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
