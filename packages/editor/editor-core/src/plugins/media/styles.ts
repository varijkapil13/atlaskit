// @ts-ignore: unused variable
// prettier-ignore
import { css, Styles, StyledComponentClass } from 'styled-components';
import { mediaSingleSharedStyle } from '@atlaskit/editor-common';
import { akColorB200, akColorN60 } from '@atlaskit/util-shared-styles';

export const mediaStyles = css`
  .ProseMirror {
    ${mediaSingleSharedStyle} & [layout='full-width'] div.media-single,
    & [layout='wide'] div.media-single {
      margin-left: 50%;
      transform: translateX(-50%);
    }

    .media-single.is-loading {
      min-height: 20px;
    }

    & [layout='wrap-left'] + [layout='wrap-right'],
    & [layout='wrap-right'] + [layout='wrap-left'] {
      clear: none;
      & + p,
      & + ul,
      & + ol,
      & + h1,
      & + h2,
      & + h3,
      & + h4,
      & + h5,
      & + h6 {
        clear: both;
      }
      & > div {
        margin-left: 0;
        margin-right: 0;
      }
    }
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
  }

  .mediaSingle-selected .mediaSingle-resize-handle-right::after,
  .mediaSingle-selected .mediaSingle-resize-handle-left::after {
    background: ${akColorN60};
  }

  .mediaSingle-resize-handle-right:hover::after,
  .mediaSingle-resize-handle-left:hover::after,
  .is-resizing .mediaSingle-resize-handle-right::after,
  .is-resizing .mediaSingle-resize-handle-left::after {
    background: ${akColorB200};
  }
`;
