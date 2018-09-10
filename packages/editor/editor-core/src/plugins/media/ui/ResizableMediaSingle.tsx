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

type Props = MediaSingleProps & { updateSize: (columnSpan: number) => void };
type State = {
  // isResizing: boolean;
  width: number;
};

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
      <Resizable
        size={{
          width: this.state.width,
        }}
        style={{
          margin: 'auto',
        }}
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
      </Resizable>
    );
  }
}
