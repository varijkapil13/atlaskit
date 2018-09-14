// @ts-ignore: unused variable
import { css, Styles, StyledComponentClass } from 'styled-components';
import { colors } from '@atlaskit/theme';

export const gridStyles = css`
  .gridParent {
    width: calc(100% + 24px);
    margin-left: -12px;
    margin-right: -12px;
    transform: scale(1);
  }

  .gridContainer {
    position: fixed;
    height: 100vh;
    width: 100%;
    border-right: 1px solid ${colors.N30};
    pointer-events: none;
  }

  .gridLine {
    border-left: 1px solid ${colors.N30};
    display: inline-block;
    box-sizing: border-box;
    height: 100%;
    margin-left: -1px;
  }
`;
