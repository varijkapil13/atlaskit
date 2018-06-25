import * as React from 'react';
import { calcTableWidth } from '@atlaskit/editor-common';
import { BreakoutConsumer } from '../';

const Table = props => {
  const colgroup = props.columnWidths ? (
    <colgroup>
      {props.columnWidths.map((colWidth, idx) => {
        return <col key={idx} style={{ width: `${colWidth}px` }} />;
      })}
    </colgroup>
  ) : null;

  return (
    <BreakoutConsumer>
      {containerWidth => (
        <div
          className="table-container"
          data-layout={props.layout}
          style={{ width: calcTableWidth(props.layout, containerWidth, false) }}
        >
          <table>
            {colgroup}
            <tbody>{props.children}</tbody>
          </table>
        </div>
      )}
    </BreakoutConsumer>
  );
};

export default Table;
