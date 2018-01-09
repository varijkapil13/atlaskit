
// @flow
import styled, { css } from 'styled-components';
import { akElevationMixins } from '@atlaskit/util-shared-styles';
import { colors } from '@atlaskit/theme';
import { TableBodyRow } from '../TableRow';

const draggableStyle = ({ isRanking, isRankingItem, rankWidth }) => css`
  &:hover {
    cursor: ${isRankingItem ? "grabbing" : "grab"};
  }

  ${isRanking && css`
    display: block; 
    width: ${rankWidth}px;
  `}

  ${isRankingItem && css`
    background-color: ${colors.N20};
    ${akElevationMixins.e500}
  `}
`;

export const RankableTableBodyRow = styled(TableBodyRow)`
  ${props => draggableStyle(props)}
`;

