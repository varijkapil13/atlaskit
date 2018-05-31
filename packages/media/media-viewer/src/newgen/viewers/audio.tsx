import * as React from 'react';
import { FileItem, Context } from '@atlaskit/media-core';
import AudioIcon from '@atlaskit/icon/glyph/media-services/audio';
import { constructAuthTokenUrl } from '../util';
import { Outcome } from '../domain';
import { Spinner } from '../loading';
import {
  ErrorMessage,
  AudioPlayer,
  AudioCover,
  Audio,
  DefaultCoverWrapper,
  colors,
} from '../styled';

export type Props = {
  item: FileItem;
  context: Context;
  collectionName?: string;
};

export type State = {
  src: Outcome<string, Error>;
  coverUrl?: string;
};

const defaultCover = (
  <DefaultCoverWrapper>
    <AudioIcon label="cover" size="xlarge" primaryColor={colors.blanketColor} />
  </DefaultCoverWrapper>
);

const getCoverUrl = (
  item: FileItem,
  context: Context,
  collectionName?: string,
): Promise<string> =>
  constructAuthTokenUrl(
    `/file/${item.details.id}/image`,
    context,
    collectionName,
  );

const saveCurrentTimeKey = 'MediaViewerPlayingTime';

export class AudioViewer extends React.Component<Props, State> {
  state: State = { src: { status: 'PENDING' } };

  canPlayThroughHandled: boolean;

  componentDidMount() {
    this.init();
  }

  render() {
    const { src } = this.state;

    switch (src.status) {
      case 'PENDING':
        return <Spinner />;
      case 'SUCCESSFUL':
        return this.renderPlayer(src.data);
      case 'FAILED':
        return <ErrorMessage>{src.err.message}</ErrorMessage>;
    }
  }

  private renderCover = () => {
    const { item } = this.props;
    const { coverUrl } = this.state;

    if (coverUrl) {
      return <AudioCover src={coverUrl} alt={item.details.name} />;
    } else {
      return defaultCover;
    }
  };

  private saveAudioElement = audioElement => {
    if (!audioElement) {
      return;
    }

    audioElement.setAttribute('controlsList', 'nodownload');
  };

  private renderPlayer = src => (
    <AudioPlayer>
      {this.renderCover()}
      <Audio
        onCanPlayThrough={this.onCanPlayThrough}
        onTimeUpdate={this.onTimeUpdate}
        controls
        innerRef={this.saveAudioElement}
        src={src}
        preload="metadata"
      />
    </AudioPlayer>
  );

  private onTimeUpdate = e => {
    this.saveCurrentPlayingTime(this.props.item, e.currentTarget.currentTime);
  };

  private onCanPlayThrough = e => {
    if (!this.canPlayThroughHandled) {
      this.canPlayThroughHandled = true;
      const audio = e.currentTarget;
      audio.currentTime = this.getCurrentPlayingTime(this.props.item);
      audio.play();
    }
  };

  private loadCover = (coverUrl: string) => {
    return new Promise(async (resolve, reject) => {
      const img = new Image();

      img.src = coverUrl;
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  private getCurrentPlayingTime(item: FileItem): number {
    return Number(
      localStorage.getItem(`${saveCurrentTimeKey}${item.details.id}`),
    );
  }

  private saveCurrentPlayingTime(item: FileItem, time: number) {
    localStorage.setItem(
      `${saveCurrentTimeKey}${item.details.id}`,
      time.toString(),
    );
  }

  private setCoverUrl = async () => {
    const { context, item, collectionName } = this.props;
    const coverUrl = await getCoverUrl(item, context, collectionName);

    try {
      await this.loadCover(coverUrl);
      this.setState({ coverUrl });
    } catch (e) {}
  };

  private async init() {
    const { context, item, collectionName } = this.props;
    const audioUrl = getAudioArtifactUrl(item);

    try {
      this.setCoverUrl();
      this.setState({
        src: {
          status: 'SUCCESSFUL',
          data: await constructAuthTokenUrl(audioUrl, context, collectionName),
        },
      });
    } catch (err) {
      this.setState({
        src: {
          status: 'FAILED',
          err,
        },
      });
    }
  }
}

function getAudioArtifactUrl(fileItem: FileItem) {
  const artifact = 'audio.mp3';
  return (
    fileItem.details &&
    fileItem.details.artifacts &&
    fileItem.details.artifacts[artifact] &&
    fileItem.details.artifacts[artifact].url
  );
}
