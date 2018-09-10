import * as React from 'react';
import {
  MediaSingleProps,
  akEditorWideLayoutWidth,
} from '@atlaskit/editor-common';
import { default as Resizable } from 're-resizable';
import { NumberSize, ResizableDirection } from 're-resizable';
import * as BezierEasing from 'bezier-easing';
import MediaSingle, {
  calcMediaWidth,
  calcMediaColumns,
} from '../../../../../editor-common/src/ui/MediaSingle';

type Props = MediaSingleProps & { updateSize: (columnSpan: number) => void };
type State = {
  // isResizing: boolean;
  width: number;
};

const clamp = ({ width, height }) => {
  const adjustedWidth =
    Math.floor(width / 170) * 170 + easeFn((width % 170) / 170) * 170;
  return {
    width: adjustedWidth,
    height: height / width * adjustedWidth,
  };
};

const easeFn = BezierEasing(1, 0, 0, 1);

class MediaResizer extends React.Component<{
  onResizeStop: (event, direction, refToElement, delta) => void;
  className: string;
}> {
  resizer?: Resizable;

  handleRef = element => {
    this.resizer = element || undefined;
  };

  // handleResize = (
  //   event: MouseEvent | TouchEvent,
  //   direction: ResizableDirection,
  //   elementRef: HTMLDivElement,
  //   delta: NumberSize,
  // ) => {
  //   if (this.resizer && this.resizer.state.original) {
  //     // const { width, height } = this.resizer.state.original!;
  //     // const factor = /*this.props.enable.left && this.props.enable.right ? 2 : 1;*/ 1;
  //     // const newWidth = Math.max(
  //     //   Math.min(width + delta.width * factor, 680),
  //     //   340,
  //     // );
  //     // const newHeight = Math.max(
  //     //   Math.min(height + delta.height * factor, height / width * 680),
  //     //   height / width * 340,
  //     // );
  //     // this.resizer.updateSize({ width: newWidth, height: newHeight });
  //   }
  // };

  render() {
    return (
      <Resizable
        {...this.props}
        ref={this.handleRef}
        // onResize={this.handleResize}
      >
        {this.props.children}
      </Resizable>
    );
  }
}

export default class ResizableMediaSingle extends React.Component<
  Props,
  State
> {
  // handleResizeStart = () => {
  //   this.setState({ isResizing: true });
  // };

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
    const { layout, width, containerWidth, columnSpan, isLoading } = this.props;

    // TODO: calc snapping based on grid plugin
    const x: number[] = [];
    for (let i = 0; i <= 6; i++) {
      x.push(
        calcMediaWidth(i, this.props.containerWidth || this.props.width, 6),
      );
    }

    // FIXME: for these, we want extra styling on the resizer so that we apply the correct margins
    x.push(akEditorWideLayoutWidth);
    if (
      this.props.containerWidth &&
      this.props.width > this.props.containerWidth
    ) {
      x.push(this.props.width);
    }

    const snap = {
      x,
    };

    return (
      <MediaResizer
        size={{
          width: this.state.width,
        }}
        style={{
          margin: 'auto',
        }}
        snap={snap}
        // grid={[680/6, 1]}
        // lockAspectRatio={aspectRatio}
        // enable={{
        //   left:
        //     this.props.layout === 'center' ||
        //     this.props.layout === 'wrap-right',
        //   right:
        //     this.props.layout === 'center' ||
        //     this.props.layout === 'wrap-left',
        // }}
        onResizeStop={this.handleResizeStop}
      >
        <MediaSingle
          {...this.props}
          columns={this.props.columns}
          gridSize={0}
          width={this.state.width}
          height={
            this.props.columns
              ? this.props.height / (this.props.width / this.state.width)
              : this.props.height
          }
        >
          {React.Children.only(this.props.children)}
        </MediaSingle>
      </MediaResizer>
    );
  }
}
