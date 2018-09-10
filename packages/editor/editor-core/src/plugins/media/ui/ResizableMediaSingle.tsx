import * as React from 'react';
import {
  MediaSingleProps,
  akEditorWideLayoutWidth,
} from '@atlaskit/editor-common';
import { default as Resizable } from 're-resizable';
import MediaSingle, {
  calcMediaWidth,
  calcMediaColumns,
} from '../../../../../editor-common/src/ui/MediaSingle';
import {
  calcMediaSingleWidth,
  floatMediaSingle,
  marginMediaSingle,
} from '../../../../../editor-common/src/ui/MediaSingle/styled';
import * as classnames from 'classnames';
import styled, { css } from 'styled-components';
import { MediaSingleLayout } from '@atlaskit/editor-common';

type Props = MediaSingleProps & {
  updateSize: (columnSpan: number) => void;
  displayGrid: (show: boolean) => void;
};

type State = {
  // isResizing: boolean;
  width: number;
};

// TODO: use attrs
export interface WrapperProps {
  layout: MediaSingleLayout;
  width: number;
  height: number;
  // containerWidth?: number;
  // columnSpan?: number;
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
    margin: ${(r: WrapperProps) => marginMediaSingle(r.layout)};
  }
`;

export default class ResizableMediaSingle extends React.Component<
  Props,
  State
> {
  handleResizeStart = () => {
    // this.setState({ isResizing: true });
    this.props.displayGrid(true);
  };

  calcWidth(props) {
    return props.columns
      ? calcMediaWidth(props.columns, props.width, props.gridSize)
      : props.width;
  }

  state = {
    // isResizing: false,
    width: this.calcWidth(this.props),
  };

  componentWillReceiveProps(nextProps) {
    const newWidth = this.calcWidth(nextProps);
    if (newWidth !== this.state.width) {
      console.log('setting new state', newWidth);
      this.setState({ width: newWidth });
    }
  }

  handleResizeStop = (
    event,
    direction,
    refToElement,
    delta: { width: number; height: number },
  ) => {
    this.props.displayGrid(false);

    const newWidth = this.state.width + delta.width;
    console.log('new width', newWidth, 'delta', delta);
    // this.setState({width: newWidth});

    // size at full size
    const maxWidth = calcMediaWidth(
      6,
      this.props.containerWidth || this.props.width,
      6,
    );
    if (newWidth <= maxWidth) {
      // would take up some columns, so define it a width using the grid
      this.props.updateSize(
        calcMediaColumns(
          newWidth,
          this.props.containerWidth || this.props.width,
          12,
        ),
      );
    } else {
      // wide or full-width
    }
  };

  render() {
    // TODO: calc snapping based on grid plugin
    // TODO: grid size is dependent on node
    const x: number[] = [];
    const gridSize =
      this.props.layout === 'wrap-left' || this.props.layout === 'wrap-right'
        ? 12
        : 6;
    for (let i = 0; i <= gridSize; i++) {
      x.push(
        calcMediaWidth(
          i,
          this.props.containerWidth || this.props.width,
          gridSize,
        ),
      );
    }

    // FIXME: for these, we want extra styling on the resizer so that we apply the correct margins
    x.push(akEditorWideLayoutWidth - 24);
    if (
      this.props.containerWidth &&
      this.props.width >= this.props.containerWidth
    ) {
      // FIXME: padding from container?
      x.push(this.props.containerWidth - 96);
    }

    const snap = {
      x,
    };

    return (
      <Wrapper
        width={this.props.width}
        height={this.props.height}
        layout={this.props.layout}
      >
        <Resizable
          size={{
            width: calcMediaSingleWidth(
              this.props.layout,
              this.state.width,
              this.props.containerWidth,
              this.props.columns,
            ),
          }}
          style={
            {
              float: floatMediaSingle(this.props.layout),
            } as React.CSSProperties
          }
          className={classnames(
            'media-single',
            this.props.layout,
            this.props.className,
            {
              'is-loading': this.props.isLoading,
              'media-wrapped':
                this.props.layout === 'wrap-left' ||
                this.props.layout === 'wrap-right',
            },
          )}
          snap={snap}
          enable={{
            left:
              this.props.layout === 'center' ||
              this.props.layout === 'wide' ||
              this.props.layout === 'full-width' ||
              this.props.layout === 'wrap-right',
            right:
              this.props.layout === 'center' ||
              this.props.layout === 'wide' ||
              this.props.layout === 'full-width' ||
              this.props.layout === 'wrap-left',
          }}
          onResizeStop={this.handleResizeStop}
          onResizeStart={this.handleResizeStart}
        >
          {/* <MediaSingle
            {...this.props}
            columns={this.props.columns}
            gridSize={0}
            width={this.state.width}
            height={
              this.props.columns
                ? this.props.height / (this.props.width / this.state.width)
                : this.props.height
            }
          > */}
          {React.Children.only(this.props.children)}
          {/* </MediaSingle> */}
        </Resizable>
      </Wrapper>
    );
  }
}
