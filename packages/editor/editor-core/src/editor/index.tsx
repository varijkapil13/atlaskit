import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withAnalytics } from '@atlaskit/analytics';
import { EditorView } from 'prosemirror-view';
import { ProviderFactory, Transformer } from '@atlaskit/editor-common';
import { getUiComponent } from './create-editor';
import EditorActions from './actions';
import { EditorProps } from './types';
import { ReactEditorView } from './create-editor';
import { EventDispatcher } from './event-dispatcher';
import EditorContext from './ui/EditorContext';

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
  private editorActions: EditorActions;

  constructor(props: EditorProps, context) {
    super(props);
    this.providerFactory = new ProviderFactory();
    this.deprecationWarnings(props);
    this.editorActions = (context || {}).editorActions || new EditorActions();
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
    eventDispatcher: EventDispatcher;
    transformer?: Transformer<string>;
  }) => {
    this.registerEditorForActions(
      instance.view,
      instance.eventDispatcher,
      instance.transformer,
    );
    if (this.props.shouldFocus) {
      if (!instance.view.hasFocus()) {
        instance.view.focus();
      }
    }
  };

  private deprecationWarnings(props) {
    if (props.hasOwnProperty('allowHyperlinks')) {
      // tslint:disable-next-line:no-console
      console.warn(
        "allowHyperlinks property is deprecated. It's safe to remove it because hyperlink plugin is enabled by default.",
      );
    }
    if (props.hasOwnProperty('allowTextFormatting')) {
      // tslint:disable-next-line:no-console
      console.warn(
        'allowTextFormatting property is deprecated. TextFormatting plugin is enabled by default. If you need to pass options to textFormatting plugin use `textFormatting={{ textFormattingOptions }}` [Will be removed in editor-core@63.0.0]',
      );
    }
  }

  onEditorDestroyed = (instance: {
    view: EditorView;
    transformer?: Transformer<string>;
  }) => {
    this.unregisterEditorFromActions();
  };

  private registerEditorForActions(
    editorView: EditorView,
    eventDispatcher: EventDispatcher,
    contentTransformer?: Transformer<string>,
  ) {
    this.editorActions._privateRegisterEditor(
      editorView,
      eventDispatcher,
      contentTransformer,
    );
  }

  private unregisterEditorFromActions() {
    if (this.editorActions) {
      this.editorActions._privateUnregisterEditor();
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
      media && media.provider ? media.provider : mediaProvider,
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
      <EditorContext editorActions={this.editorActions}>
        <ReactEditorView
          editorProps={this.props}
          providerFactory={this.providerFactory}
          onEditorCreated={this.onEditorCreated}
          onEditorDestroyed={this.onEditorDestroyed}
          render={({ editor, view, eventDispatcher, config }) => (
            <Component
              disabled={this.props.disabled}
              editorActions={this.editorActions}
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
              insertMenuItems={this.props.insertMenuItems}
              customContentComponents={this.props.contentComponents}
              customPrimaryToolbarComponents={
                this.props.primaryToolbarComponents
              }
              customSecondaryToolbarComponents={
                this.props.secondaryToolbarComponents
              }
              addonToolbarComponents={this.props.addonToolbarComponents}
            />
          )}
        />
      </EditorContext>
    );
  }
}

export const EditorWithAnalytics = withAnalytics<typeof Editor>(
  Editor,
  {},
  {},
  true,
);
