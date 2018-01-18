import * as React from 'react';
import { Node, NodeSpec, Schema, MarkSpec, Mark } from 'prosemirror-model';
import { EditorState, Plugin, Transaction, Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { analyticsService, AnalyticsHandler } from '../../analytics';
import { EditorPlugin, EditorProps, EditorConfig } from '../types';
import { ProviderFactory, Transformer } from '@atlaskit/editor-common';
import ErrorReporter from '../../utils/error-reporter';
import { EventDispatcher, createDispatch, Dispatch } from '../event-dispatcher';
import { name, version } from '../../version';
import createPluginList from './create-plugins-list';

export function sortByRank(a: { rank: number }, b: { rank: number }): number {
  return a.rank - b.rank;
}

export function fixExcludes(marks: {
  [key: string]: MarkSpec;
}): { [key: string]: MarkSpec } {
  const markKeys = Object.keys(marks);
  const markGroups = new Set(markKeys.map(mark => marks[mark].group));

  markKeys.map(markKey => {
    const mark = marks[markKey];
    if (mark.excludes) {
      mark.excludes = mark.excludes
        .split(' ')
        .filter(group => markGroups.has(group))
        .join(' ');
    }
  });
  return marks;
}

export function fixNodeContentSchema(
  nodes: { [key: string]: NodeSpec },
  supportedMarks: { [key: string]: MarkSpec },
): { [key: string]: NodeSpec } {
  Object.keys(nodes).forEach(nodeKey => {
    const node = nodes[nodeKey];
    if (node.marks && node.marks !== '_') {
      node.marks = node.marks
        .split(' ')
        .filter(mark => !!supportedMarks[mark])
        .join(' ');
    }
    if (node.content && !supportedMarks['link']) {
      node.content = node.content.replace('<link>', '');
    }
  });
  return nodes;
}

export function processPluginsList(plugins: EditorPlugin[]): EditorConfig {
  return plugins.reduce(
    (acc, plugin) => {
      if (plugin.pmPlugins) {
        acc.pmPlugins.push(...plugin.pmPlugins());
      }

      if (plugin.nodes) {
        acc.nodes.push(...plugin.nodes());
      }

      if (plugin.marks) {
        acc.marks.push(...plugin.marks());
      }

      if (plugin.contentComponent) {
        acc.contentComponents.push(plugin.contentComponent);
      }

      if (plugin.primaryToolbarComponent) {
        acc.primaryToolbarComponents.push(plugin.primaryToolbarComponent);
      }

      if (plugin.secondaryToolbarComponent) {
        acc.secondaryToolbarComponents.push(plugin.secondaryToolbarComponent);
      }

      return acc;
    },
    {
      nodes: [],
      marks: [],
      pmPlugins: [],
      contentComponents: [],
      primaryToolbarComponents: [],
      secondaryToolbarComponents: [],
    } as EditorConfig,
  );
}

export function createSchema(editorConfig: EditorConfig) {
  const marks = fixExcludes(
    editorConfig.marks.sort(sortByRank).reduce((acc, mark) => {
      acc[mark.name] = mark.mark;
      return acc;
    }, {}),
  );

  const nodes = fixNodeContentSchema(
    editorConfig.nodes.sort(sortByRank).reduce((acc, node) => {
      acc[node.name] = node.node;
      return acc;
    }, {}),
    marks,
  );

  return new Schema({ nodes, marks });
}

export function createPMPlugins(
  editorConfig: EditorConfig,
  schema: Schema,
  props: EditorProps,
  dispatch: Dispatch,
  providerFactory: ProviderFactory,
  errorReporter: ErrorReporter,
): Plugin[] {
  return editorConfig.pmPlugins
    .sort(sortByRank)
    .map(({ plugin }) =>
      plugin({ schema, props, dispatch, providerFactory, errorReporter }),
    )
    .filter(plugin => !!plugin) as Plugin[];
}

export function createErrorReporter(errorReporterHandler) {
  const errorReporter = new ErrorReporter();
  if (errorReporterHandler) {
    errorReporter.handler = errorReporterHandler;
  }
  return errorReporter;
}

export function initAnalytics(analyticsHandler?: AnalyticsHandler) {
  analyticsService.handler = analyticsHandler || (() => {});
  analyticsService.trackEvent('atlassian.editor.start', {
    name,
    version,
  });
}

export function processDefaultDocument(
  schema: Schema,
  rawDoc?: Node | string | Object,
): Node | undefined {
  if (!rawDoc) {
    return;
  }

  if (rawDoc instanceof Node) {
    return rawDoc;
  }

  let doc: Object;
  if (typeof rawDoc === 'string') {
    try {
      doc = JSON.parse(rawDoc);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(
        `Error processing default value: ${rawDoc} isn't valid JSON document`,
      );
      return;
    }
  } else {
    doc = rawDoc;
  }

  if (Array.isArray(doc)) {
    // tslint:disable-next-line:no-console
    console.error(
      `Error processing default value: ${doc} is an array, but it must be an object with the following shape { type: 'doc', content: [...] }`,
    );
    return;
  }

  try {
    const parsedDoc = Node.fromJSON(schema, doc);
    // throws an error if the document is invalid
    parsedDoc.check();
    return parsedDoc;
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(`Error processing default value: ${doc} – ${e.message}`);
    return;
  }
}

export interface EditorViewProps {
  editorProps: EditorProps;
  providerFactory: ProviderFactory;
  render: (
    props: {
      editor: JSX.Element;
      state: EditorState;
      view?: EditorView;
      config: EditorConfig;
      eventDispatcher: EventDispatcher;
      transformer?: Transformer<string>;
    },
  ) => JSX.Element;
  onEditorCreated: (
    instance: {
      state: EditorState;
      view: EditorView;
      config: EditorConfig;
      eventDispatcher: EventDispatcher;
      transformer?: Transformer<string>;
    },
  ) => void;
  onEditorDestroyed: (
    instance: {
      state: EditorState;
      view: EditorView;
      config: EditorConfig;
      eventDispatcher: EventDispatcher;
      transformer?: Transformer<string>;
    },
  ) => void;
}

export interface EditorViewState {
  editorState: EditorState;
}

export default class ReactEditorView extends React.Component<
  EditorViewProps,
  EditorViewState
> {
  view?: EditorView;
  eventDispatcher: EventDispatcher;
  contentTransformer?: Transformer<string>;
  config: EditorConfig;

  constructor(props: EditorViewProps) {
    super(props);

    this.state = {
      editorState: this.createEditorState({ props, replaceDoc: true }),
    };
  }

  componentWillReceiveProps(nextProps: EditorViewProps) {
    if (
      this.props.editorProps.appearance !== nextProps.editorProps.appearance
    ) {
      this.setState(prevState => ({
        editorState: this.createEditorState({
          props: this.props,
          state: prevState,
        }),
      }));
    }
  }

  componentWillUnmount() {
    this.eventDispatcher.destroy();
  }

  createEditorState = (options: {
    props: EditorViewProps;
    state?: EditorViewState;
    replaceDoc?: boolean;
  }) => {
    this.config = processPluginsList(
      createPluginList(options.props.editorProps),
    );
    const schema = createSchema(this.config);

    const {
      contentTransformerProvider,
      errorReporterHandler,
    } = this.props.editorProps;

    this.eventDispatcher = new EventDispatcher();
    const dispatch = createDispatch(this.eventDispatcher);
    const errorReporter = createErrorReporter(errorReporterHandler);
    const plugins = createPMPlugins(
      this.config,
      schema,
      options.props.editorProps,
      dispatch,
      options.props.providerFactory,
      errorReporter,
    );

    this.contentTransformer = contentTransformerProvider
      ? contentTransformerProvider(schema)
      : undefined;

    let doc;
    if (options.replaceDoc) {
      const { defaultValue } = options.props.editorProps;
      doc =
        this.contentTransformer && typeof defaultValue === 'string'
          ? this.contentTransformer.parse(defaultValue)
          : processDefaultDocument(schema, defaultValue);
    }

    if (
      this.view /* && this.view.state.schema !== schema; - this is implicit */
    ) {
      const prevEditorState = options.state!.editorState;
      const editorState = prevEditorState.reconfigure({ schema, plugins });
      doc = doc || schema.nodeFromJSON(prevEditorState.doc.toJSON());
      const selection = Selection.fromJSON(
        doc,
        prevEditorState.selection.toJSON(),
      );
      const storedMarks = prevEditorState.storedMarks
        ? prevEditorState.storedMarks.map(mark =>
            Mark.fromJSON(schema, mark.toJSON()),
          )
        : undefined;

      doc.check();
      Object.assign(editorState, { doc, selection, storedMarks });
    }
    return EditorState.create({
      schema,
      plugins,
      doc,
      selection: doc ? Selection.atEnd(doc) : undefined,
    });
  };

  createEditorView = node => {
    if (!this.view && node) {
      this.view = new EditorView(node, {
        state: this.state.editorState,
        dispatchTransaction: this.dispatchTransaction,
      });
      this.props.onEditorCreated({
        view: this.view,
        state: this.state.editorState,
        config: this.config,
        eventDispatcher: this.eventDispatcher,
        transformer: this.contentTransformer,
      });
      this.forceUpdate();
    } else if (this.view && !node) {
      this.props.onEditorDestroyed({
        view: this.view,
        state: this.state.editorState,
        config: this.config,
        eventDispatcher: this.eventDispatcher,
        transformer: this.contentTransformer,
      });
      this.view = undefined;
    }
  };

  dispatchTransaction = (transaction: Transaction) => {
    transaction.setMeta('isLocal', true);
    const editorState = this.view!.state.apply(transaction);
    this.view!.updateState(editorState);
    this.setState({ editorState });
  };

  render() {
    const editor = <div ref={this.createEditorView} />;
    return this.props.render
      ? this.props.render({
          editor,
          state: this.state.editorState,
          view: this.view,
          config: this.config,
          eventDispatcher: this.eventDispatcher,
          transformer: this.contentTransformer,
        })
      : editor;
  }
}
