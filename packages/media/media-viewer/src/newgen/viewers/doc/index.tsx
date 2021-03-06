import * as React from 'react';
import { Context, FileItem } from '@atlaskit/media-core';
import { Outcome } from '../../domain';
import { ErrorMessage, createError, MediaViewerError } from '../../error';
import { Spinner } from '../../loading';
import { constructAuthTokenUrl } from '../../utils';
import { Props as RendererProps } from './pdfRenderer';
import { ComponentClass } from 'react';
import { renderDownloadButton } from '../../domain/download';

const moduleLoader = () =>
  import(/* webpackChunkName:"@atlaskit-internal_media-viewer-pdf-viewer" */ './pdfRenderer');

const componentLoader: () => Promise<ComponentClass<RendererProps>> = () =>
  moduleLoader().then(module => module.PDFRenderer);

export type Props = {
  context: Context;
  item: FileItem;
  collectionName?: string;
  onClose?: () => void;
};

export type State = {
  src: Outcome<string, MediaViewerError>;
};

const initialState: State = {
  src: Outcome.pending(),
};

export class DocViewer extends React.Component<Props, State> {
  static PDFComponent: ComponentClass<RendererProps>;

  state: State = initialState;

  componentDidMount() {
    this.init();
  }

  private async init() {
    if (!DocViewer.PDFComponent) {
      await this.loadDocViewer();
    }
    const { item, context, collectionName } = this.props;

    const pdfArtifactUrl = getPDFUrl(item);
    if (!pdfArtifactUrl) {
      this.setState({
        src: Outcome.failed(createError('noPDFArtifactsFound')),
      });
      return;
    }
    try {
      const src = await constructAuthTokenUrl(
        pdfArtifactUrl,
        context,
        collectionName,
      );
      this.setState({
        src: Outcome.successful(src),
      });
    } catch (err) {
      this.setState({
        src: Outcome.failed(createError('previewFailed', undefined, err)),
      });
    }
  }

  private async loadDocViewer() {
    DocViewer.PDFComponent = await componentLoader();
    this.forceUpdate();
  }

  private renderDownloadButton() {
    const { item, context, collectionName } = this.props;
    return renderDownloadButton(item, context, collectionName);
  }

  render() {
    const { onClose } = this.props;
    const { PDFComponent } = DocViewer;

    if (!PDFComponent) {
      return <Spinner />;
    }

    return this.state.src.match({
      pending: () => <Spinner />,
      successful: src => <PDFComponent src={src} onClose={onClose} />,
      failed: err => (
        <ErrorMessage error={err}>
          <p>Try downloading the file to view it.</p>
          {this.renderDownloadButton()}
        </ErrorMessage>
      ),
    });
  }
}

function getPDFUrl(fileItem: FileItem) {
  const artifact = 'document.pdf';
  return (
    fileItem.details &&
    fileItem.details.artifacts &&
    fileItem.details.artifacts[artifact] &&
    fileItem.details.artifacts[artifact].url
  );
}
