import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withAnalytics } from '@atlaskit/analytics';
import { getUiComponent } from './create-editor';
import EditorActions from './actions';
import { ProviderFactory, Transformer } from '@atlaskit/editor-common';
import { EditorProps } from './types';
import { ReactEditorView } from './create-editor';
import { EditorView } from 'prosemirror-view';
export * from './types';

export default class Editor extends React.Component<EditorProps, {}> {
  static defaultProps: EditorProps = {
    appearance: 'message',
    disabled: false,
  };

  static contextTypes = {
    editorActions: PropTypes.object,
  };

  context: {
    editorActions?: EditorActions;
  };

  private providerFactory: ProviderFactory;

  constructor(props: EditorProps) {
    super(props);
    this.providerFactory = new ProviderFactory();
  }

  componentDidMount() {
    this.handleProviders(this.props);
  }

  componentWillReceiveProps(nextProps: EditorProps) {
    this.handleProviders(nextProps);
  }

  componentWillUnmount() {
    this.unregisterEditorFromActions();
    this.providerFactory.destroy();
  }

  onEditorCreated = (instance: {
    view: EditorView;
    transformer?: Transformer<string>;
  }) => {
    this.registerEditorForActions(instance.view, instance.transformer);
    if (this.props.shouldFocus) {
      if (!instance.view.hasFocus()) {
        instance.view.focus();
      }
    }
  };

  onEditorDestroyed = (instance: {
    view: EditorView;
    transformer?: Transformer<string>;
  }) => {
    this.unregisterEditorFromActions();
  };

  private registerEditorForActions(
    editorView: EditorView,
    contentTransformer?: Transformer<string>,
  ) {
    if (this.context && this.context.editorActions) {
      this.context.editorActions._privateRegisterEditor(
        editorView,
        contentTransformer,
      );
    }
  }

  private unregisterEditorFromActions() {
    if (this.context && this.context.editorActions) {
      this.context.editorActions._privateUnregisterEditor();
    }
  }

  private handleProviders(props: EditorProps) {
    const {
      emojiProvider,
      mentionProvider,
      mediaProvider,
      taskDecisionProvider,
      contextIdentifierProvider,
      collabEditProvider,
      activityProvider,
      presenceProvider,
      macroProvider,
      legacyImageUploadProvider,
      media,
    } = props;
    this.providerFactory.setProvider('emojiProvider', emojiProvider);
    this.providerFactory.setProvider('mentionProvider', mentionProvider);
    this.providerFactory.setProvider(
      'taskDecisionProvider',
      taskDecisionProvider,
    );
    this.providerFactory.setProvider(
      'contextIdentifierProvider',
      contextIdentifierProvider,
    );
    this.providerFactory.setProvider(
      'mediaProvider',
      media ? media.provider : mediaProvider,
    );
    this.providerFactory.setProvider(
      'imageUploadProvider',
      legacyImageUploadProvider,
    );
    this.providerFactory.setProvider('collabEditProvider', collabEditProvider);
    this.providerFactory.setProvider('activityProvider', activityProvider);
    this.providerFactory.setProvider('presenceProvider', presenceProvider);
    this.providerFactory.setProvider('macroProvider', macroProvider);
  }

  render() {
    const Component = getUiComponent(this.props.appearance);

    return (
      <ReactEditorView
        editorProps={this.props}
        providerFactory={this.providerFactory}
        onEditorCreated={this.onEditorCreated}
        onEditorDestroyed={this.onEditorDestroyed}
        render={({ editor, view, state, eventDispatcher, config }) => (
          <Component
            disabled={this.props.disabled}
            editorDOMElement={editor}
            editorView={view}
            providerFactory={this.providerFactory}
            eventDispatcher={eventDispatcher}
            maxHeight={this.props.maxHeight}
            onSave={this.props.onSave}
            onCancel={this.props.onCancel}
            popupsMountPoint={this.props.popupsMountPoint}
            popupsBoundariesElement={this.props.popupsBoundariesElement}
            contentComponents={config.contentComponents}
            primaryToolbarComponents={config.primaryToolbarComponents}
            secondaryToolbarComponents={config.secondaryToolbarComponents}
            customContentComponents={this.props.contentComponents}
            customPrimaryToolbarComponents={this.props.primaryToolbarComponents}
            customSecondaryToolbarComponents={
              this.props.secondaryToolbarComponents
            }
            addonToolbarComponents={this.props.addonToolbarComponents}
          />
        )}
      />
    );
  }
}

export const EditorWithAnalytics = withAnalytics<typeof Editor>(
  Editor,
  {},
  {},
  true,
);
