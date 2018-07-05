// @flow
import { Component } from 'react';
import type { Props } from './TreeItem-types';
import { isSamePath } from '../../utils/path';
import { sameProps } from '../../utils/react';

export default class TreeItem extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return (
      !sameProps(this.props, nextProps, ['item', 'provided', 'snapshot']) ||
      !isSamePath(this.props.path, nextProps.path)
    );
  }

  render() {
    const {
      item,
      path,
      onExpand,
      onCollapse,
      renderItem,
      provided,
      snapshot,
    } = this.props;

    const finalProvided: TreeDraggableProvided = {
      ...provided,
      props: {
        innerRef: provided.innerRef,
        ...provided.draggableProps,
        ...provided.dragHandleProps,
      },
    };

    return renderItem({
      item,
      depth: path.length - 1,
      onExpand: itemId => onExpand(itemId, path),
      onCollapse: itemId => onCollapse(itemId, path),
      provided: finalProvided,
      snapshot,
    });
  }
}
