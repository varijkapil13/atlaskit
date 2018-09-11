// @ts-ignore: unused variable
// prettier-ignore
import { css, Styles, StyledComponentClass } from 'styled-components';
import {
  akColorN90,
  akColorB200,
  akColorN70,
  akColorN60,
} from '@atlaskit/util-shared-styles';

const mediaSingleSharedStyle = css`
  li .media-single {
    margin: 0;
  }

  table .media-single {
    margin: 0;
    width: inherit;
  }

  .mediaSingle-resize-handle-right,
  .mediaSingle-resize-handle-left {
    display: flex;
    flex-direction: column;

    /* vertical align */
    justify-content: center;
  }

  .mediaSingle-resize-handle-right {
    align-items: flex-end;
  }

  .mediaSingle-resize-handle-left {
    align-items: flex-start;
  }

  .mediaSingle-resize-handle-right::after,
  .mediaSingle-resize-handle-left::after {
    content: ' ';
    display: flex;
    width: 3px;
    height: 64px;

    border-radius: 6px;
    /*background: ${akColorN60};*/
  }

  .mediaSingle-resize-handle-right:hover::after,
  .mediaSingle-resize-handle-left:hover::after {
    background: ${akColorB200};
  }
`;

export { mediaSingleSharedStyle };
