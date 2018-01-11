// @flow
import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { RankableTableBodyRow } from '../../styled/rankable/TableRow';
import { RowPlaceholderCell, RowPlaceholderWrapper } from '../../styled/rankable/RowPlaceholder';
import type { HeadType, RowType } from '../../types';
import withDimensions, {type WithDimensionsProps} from '../../hoc/withDimensions';
import TableCell from './TableCell';

type Props = {
  head: HeadType | void,
  isFixedSize: boolean,
  row: RowType,
  isRanking: boolean,
  rowIndex: number,
} & WithDimensionsProps;

class RankableTableRow extends Component<Props, {}> {

  innerRef = (innerRefFn) => (ref) => {
    innerRefFn(ref);
    this.props.innerRef(ref);
  }

  render() {
    const { row, head, isFixedSize, isRanking, refWidth, refHeight, rowIndex } = this.props;
    const { cells, ...restRowProps } = row;
    const inlineStyle = isRanking ? {width: refWidth} : {};

    return (
      <Draggable draggableId={typeof(row.key) === 'undefined' ? row.key : rowIndex} index={rowIndex}>
      {(provided, snapshot) => [
        <RankableTableBodyRow {...restRowProps} 
          innerRef={this.innerRef(provided.innerRef)} 
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          style={{...provided.draggableProps.style, ...inlineStyle}}
          isRanking={isRanking}
          isRankingItem={snapshot.isDragging}
        >
        {cells.map((cell, cellIndex) => {
          const headCell = (head || { cells: [] }).cells[cellIndex];
  
          return <TableCell 
            head={headCell} 
            cell={cell} 
            isRanking={isRanking}
            key={cellIndex} // eslint-disable-line react/no-array-index-key
            isFixedSize={isFixedSize}
          />;
        })}
      </RankableTableBodyRow>,
   
      provided.placeholder ? <tr>
        <RowPlaceholderCell colSpan={cells.length}>
          <div style={{width: refWidth, height: refHeight}}>
            {provided.placeholder}
          </div>
        </RowPlaceholderCell>
      </tr> : null
      ]}
      </Draggable>
    );
  }
};

export default withDimensions(RankableTableRow);