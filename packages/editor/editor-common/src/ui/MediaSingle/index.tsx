import * as React from 'react';
import { MediaSingleLayout, MediaSingleSize } from '../../schema';
import * as BrokenImportResizable from 're-resizable';
import { default as ResizableType } from 're-resizable';
import styled from 'styled-components';
import { updateColumnsOnResize } from '../../../../editor-core/node_modules/@types/prosemirror-tables';

const Resizable = (BrokenImportResizable as any) as ResizableType;

export interface Props {
  children: React.ReactChild;
  layout: MediaSingleLayout;
  size: MediaSingleSize;
  aspectRatio: number;
  containerWidth?: number;
  isLoading?: boolean;
  className?: string;
  updateSize?: (size: string) => void;
}

class MediaSingle extends React.Component<Props> {
  handleResizeStop = (
    event,
    direction,
    refToElement,
    delta: { width: number; height: number },
  ) => {
    const sizeMap = {
      '50%': 0.5,
      '75%': 0.75,
      '100%': 1,
    };

    const currentRatio = sizeMap[this.props.size];

    const pageWidth = 680;

    const newWidth = currentRatio * pageWidth + delta.width;

    let newSize;
    if (newWidth >= 680) {
      newSize = '100%';
    } else if (newWidth > sizeMap['75%'] * pageWidth) {
      newSize = '75%';
    } else if (newWidth > sizeMap['50%'] * pageWidth) {
      newSize = '50%';
    }

    console.log({ delta, currentRatio, newWidth, newSize });

    this.props.updateSize(newSize);

    // if (delta.width > 300) {
    //   this.props.updateSize(this.props.size !== 10'5');
    // } else if(delta.width < -300) {
    //   this.props.updateSize(false);
    // }
  };

  render() {
    const { children, aspectRatio, className, size } = this.props;
    const ratio = size === '50%' ? 0.5 : size === '75%' ? 0.75 : 1;
    return (
      <Resizable
        className={className}
        size={{
          width: 680 * ratio,
          height: 680 * ratio / aspectRatio,
        }}
        lockAspectRatio={aspectRatio}
        // grid={[gridSize, aspectRatio ? gridSize / aspectRatio : gridSize]}
        maxWidth="100%"
        onResizeStop={this.handleResizeStop}
      >
        {React.Children.only(children)}
      </Resizable>
    );
  }
}

export default styled(MediaSingle)`
  margin: 0 auto;

  & > div {
    position: absolute;
    height: 100%;
  }
`;
