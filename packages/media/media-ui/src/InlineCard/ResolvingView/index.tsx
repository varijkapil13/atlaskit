import * as React from 'react';
import { Frame } from '../Frame';
import Spinner from '@atlaskit/spinner';
import { IconAndTitleLayout } from '../IconAndTitleLayout';

export interface ResolvingViewProps {
  url: string;
  onClick?: () => void;
}

export class ResolvingView extends React.Component<ResolvingViewProps> {
  render() {
    const { url, onClick } = this.props;
    return (
      <Frame onClick={onClick}>
        <IconAndTitleLayout icon={<Spinner size={16} />} title={url}>
          - Connect your account to preview links
        </IconAndTitleLayout>
      </Frame>
    );
  }
}
