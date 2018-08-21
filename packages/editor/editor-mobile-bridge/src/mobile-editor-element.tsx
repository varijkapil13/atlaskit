import * as React from 'react';
import { EditorView } from 'prosemirror-view';
import {
  Editor,
  mentionPluginKey,
  textFormattingStateKey,
  blockPluginStateKey,
  ListsState,
  listsStateKey,
} from '@atlaskit/editor-core';
import {
  TaskDecisionProvider,
  Query,
  DecisionResponse,
  TaskResponse,
  ItemResponse,
  RecentUpdatesId,
  RecentUpdateContext,
  ObjectKey,
  TaskState,
  Handler,
} from '@atlaskit/task-decision';
import { MentionDescription, MentionProvider } from '@atlaskit/mention';
import { valueOf as valueOfMarkState } from './web-to-native/markState';
import { valueOf as valueOfListState } from './web-to-native/listState';
import { toNativeBridge } from './web-to-native';
import WebBridgeImpl from './native-to-web';
import { ContextFactory } from '@atlaskit/media-core';
import { createPromise } from './cross-platform-promise';
import MobilePicker from './MobileMediaPicker';

/**
 * In order to enable mentions in Editor we must set both properties: allowMentions and mentionProvider.
 * So this type is supposed to be a stub version of mention provider. We don't actually need it.
 */
export class MentionProviderImpl implements MentionProvider {
  filter(query?: string): void {}

  recordMentionSelection(mention: MentionDescription): void {}

  shouldHighlightMention(mention: MentionDescription): boolean {
    return false;
  }

  isFiltering(query: string): boolean {
    return false;
  }

  subscribe(
    key: string,
    callback?,
    errCallback?,
    infoCallback?,
    allResultsCallback?,
  ): void {}

  unsubscribe(key: string): void {}
}

export class TaskDecisionProviderImpl implements TaskDecisionProvider {
  getDecisions(query: Query): Promise<DecisionResponse> {
    return Promise.resolve({ decisions: [] });
  }
  getTasks(query: Query): Promise<TaskResponse> {
    return Promise.resolve({ tasks: [] });
  }
  getItems(query: Query): Promise<ItemResponse> {
    return Promise.resolve({ items: [] });
  }
  unsubscribeRecentUpdates(id: RecentUpdatesId) {}
  notifyRecentUpdates(updateContext?: RecentUpdateContext) {}
  toggleTask(key: ObjectKey, state: TaskState): Promise<TaskState> {
    return Promise.resolve('DONE' as TaskState);
  }
  subscribe(key: ObjectKey, handler: Handler) {}
  unsubscribe(key: ObjectKey, handler: Handler) {}
}

const bridge: WebBridgeImpl = ((window as any).bridge = new WebBridgeImpl());

class EditorWithState extends Editor {
  onEditorCreated(instance: {
    view: EditorView;
    eventDispatcher: any;
    transformer?: any;
  }) {
    super.onEditorCreated(instance);
    const { eventDispatcher, view } = instance;
    bridge.editorView = view;
    bridge.editorActions._privateRegisterEditor(view, eventDispatcher);
    if (this.props.media && this.props.media.customMediaPicker) {
      bridge.mediaPicker = this.props.media.customMediaPicker;
    }
    subscribeForMentionStateChanges(view, eventDispatcher);
    subscribeForTextFormatChanges(view, eventDispatcher);
    subscribeForBlockStateChanges(view, eventDispatcher);
    subscribeForListStateChanges(view, eventDispatcher);
  }

  onEditorDestroyed(instance: {
    view: EditorView;
    eventDispatcher: any;
    transformer?: any;
  }) {
    super.onEditorDestroyed(instance);

    const { eventDispatcher, view } = instance;
    unsubscribeFromBlockStateChanges(view, eventDispatcher);
    unsubscribeFromListStateChanges(view, eventDispatcher);

    bridge.editorActions._privateUnregisterEditor();
    bridge.editorView = null;
    bridge.mentionsPluginState = null;
    bridge.textFormattingPluginState = null;
  }
}

function subscribeForMentionStateChanges(
  view: EditorView,
  eventDispatcher: any,
) {
  let mentionsPluginState = mentionPluginKey.getState(view.state);
  bridge.mentionsPluginState = mentionsPluginState;
  if (mentionsPluginState) {
    mentionsPluginState.subscribe(state => sendToNative(state));
  }
}

function sendToNative(state) {
  if (state.queryActive) {
    toNativeBridge.showMentions(state.query || '');
  } else {
    toNativeBridge.dismissMentions();
  }
}

function subscribeForTextFormatChanges(view: EditorView, eventDispatcher: any) {
  let textFormattingPluginState = textFormattingStateKey.getState(view.state);
  bridge.textFormattingPluginState = textFormattingPluginState;
  eventDispatcher.on((textFormattingStateKey as any).key, state => {
    toNativeBridge.updateTextFormat(JSON.stringify(valueOfMarkState(state)));
  });
}

const blockStateUpdated = state => {
  toNativeBridge.updateBlockState(state.currentBlockType.name);
};

function subscribeForBlockStateChanges(view: EditorView, eventDispatcher: any) {
  bridge.blockState = blockPluginStateKey.getState(view.state);
  eventDispatcher.on((blockPluginStateKey as any).key, blockStateUpdated);
}

function unsubscribeFromBlockStateChanges(
  view: EditorView,
  eventDispatcher: any,
) {
  eventDispatcher.off((blockPluginStateKey as any).key, blockStateUpdated);
  bridge.blockState = undefined;
}

const listStateUpdated = state => {
  toNativeBridge.updateListState(JSON.stringify(valueOfListState(state)));
};

function subscribeForListStateChanges(view: EditorView, eventDispatcher: any) {
  const listState: ListsState = listsStateKey.getState(view.state);
  bridge.listState = listState;
  eventDispatcher.on((listsStateKey as any).key, listStateUpdated);
}

function unsubscribeFromListStateChanges(
  view: EditorView,
  eventDispatcher: any,
) {
  eventDispatcher.off((listsStateKey as any).key, listStateUpdated);
}

function getToken(context?: any) {
  return createPromise<any>('getAuth', context.collectionName).submit();
}

function getUploadContext(): Promise<any> {
  // TODO Make sure getToken returns baseUrl and revert that back to just getToken
  const authProviderWithBaseUrl = (context?: any) =>
    getToken(context).then(auth => {
      auth.baseUrl = toNativeBridge.getServiceHost();
      return auth;
    });
  return Promise.resolve(
    ContextFactory.create({
      authProvider: authProviderWithBaseUrl,
    }),
  );
}

function createMediaProvider() {
  return {
    viewContext: getUploadContext(),
    uploadContext: getUploadContext(),
    uploadParams: {
      collection: toNativeBridge.getCollection(),
    },
  };
}

export default function mobileEditor() {
  return (
    <EditorWithState
      appearance="mobile"
      mentionProvider={Promise.resolve(new MentionProviderImpl())}
      media={{
        customMediaPicker: new MobilePicker(),
        provider: Promise.resolve(createMediaProvider()),
        allowMediaSingle: true,
      }}
      onChange={() => {
        toNativeBridge.updateText(bridge.getContent());
      }}
      allowPanel={true}
      allowTables={{
        allowControls: false,
      }}
      allowExtension={true}
      allowTextColor={true}
      allowDate={true}
      allowRule={true}
      taskDecisionProvider={Promise.resolve(new TaskDecisionProviderImpl())}
    />
  );
}
