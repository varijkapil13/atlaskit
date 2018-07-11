import { Node } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Dispatch } from '../../../event-dispatcher';
import { getCursor } from '../../../utils';

export enum LinkAction {
  SHOW_INSERT_TOOLBAR = 'show_insert',
  HIDE_TOOLBAR = 'hide_toolbar',
  SELECTION_CHANGE = 'selection_change',
}
export enum InsertStatus {
  EDIT_LINK_TOOLBAR = 'edit',
  INSERT_LINK_TOOLBAR = 'insert',
}
export type LinkToolbarState =
  | {
      type: InsertStatus.EDIT_LINK_TOOLBAR;
      node: Node;
      pos: number;
    }
  | {
      type: InsertStatus.INSERT_LINK_TOOLBAR;
      from: number;
      to: number;
    }
  | undefined;

export const canLinkBeCreatedInRange = (from: number, to: number) => (
  state: EditorState,
) => {
  if (!state.doc.rangeHasMark(from, to, state.schema.marks.link)) {
    const $from = state.doc.resolve(from);
    const $to = state.doc.resolve(to);
    const link = state.schema.marks.link;
    if ($from.parent === $to.parent && $from.parent.isTextblock) {
      if ($from.parent.type.allowsMarkType(link)) {
        let allowed = true;
        state.doc.nodesBetween(from, to, node => {
          allowed = allowed && !node.marks.some(m => m.type.excludes(link));
          return allowed;
        });
        return allowed;
      }
    }
  }
  return false;
};

const isSelectionInsideLink = (state: EditorState | Transaction): boolean => {
  const $cursor = getCursor(state.selection);
  return $cursor
    ? !!state.doc.type.schema.marks.link.isInSet($cursor.marks())
    : false;
};

const mapTransactionToState = (
  state: LinkToolbarState,
  tr: Transaction,
): LinkToolbarState => {
  if (!state) {
    return undefined;
  } else if (state.type === InsertStatus.EDIT_LINK_TOOLBAR) {
    const { pos, deleted } = tr.mapping.mapResult(state.pos, 1);
    const node = tr.doc.nodeAt(pos) as Node;
    // If the position was not deleted & it is still a link
    if (!deleted && !!node.type.schema.marks.link.isInSet(node.marks)) {
      if (node === state.node && pos === state.pos) {
        return state;
      }
      return { ...state, pos, node };
    }
    // If the position has been deleted, then require a navigation to show the toolbar again
    return undefined;
  } else if (state.type === InsertStatus.INSERT_LINK_TOOLBAR) {
    return {
      ...state,
      from: tr.mapping.map(state.from),
      to: tr.mapping.map(state.to),
    };
  }
};

const toState = (
  state: LinkToolbarState,
  action: LinkAction,
  editorState: EditorState,
): LinkToolbarState => {
  // Show insert or edit toolbar
  if (!state) {
    switch (action) {
      case LinkAction.SHOW_INSERT_TOOLBAR:
        const { from, to } = editorState.selection;
        if (canLinkBeCreatedInRange(from, to)(editorState)) {
          return { type: InsertStatus.INSERT_LINK_TOOLBAR, from, to };
        }
        return undefined;
      case LinkAction.SELECTION_CHANGE:
        // If the user has moved their cursor, see if they're in a link
        const link = getActiveLinkMark(editorState);
        if (link) {
          return { ...link, type: InsertStatus.EDIT_LINK_TOOLBAR };
        }
        return undefined;
      default:
        return undefined;
    }
  }

  // Update toolbar state if selection changes, or if toolbar is hidden
  if (state.type === InsertStatus.EDIT_LINK_TOOLBAR) {
    switch (action) {
      case LinkAction.SELECTION_CHANGE:
        const link = getActiveLinkMark(editorState);
        if (link) {
          if (link.pos === state.pos && link.node === state.node) {
            // Make sure we return the same object, if it's the same link
            return state;
          }
          return { ...link, type: InsertStatus.EDIT_LINK_TOOLBAR };
        }
        return undefined;
      case LinkAction.HIDE_TOOLBAR:
        return undefined;
      default:
        return state;
    }
  }

  // Remove toolbar if user changes selection or toolbar is hidden
  if (state.type === InsertStatus.INSERT_LINK_TOOLBAR) {
    switch (action) {
      case LinkAction.SELECTION_CHANGE:
      case LinkAction.HIDE_TOOLBAR:
        return undefined;
      default:
        return state;
    }
  }
};

const getActiveLinkMark = (state: EditorState | Transaction) => {
  if (isSelectionInsideLink(state)) {
    const $cursor = getCursor(state.selection)!;
    const pos = $cursor.pos - $cursor.textOffset;
    const node = state.doc.nodeAt(pos);
    return node && node.isText ? { node, pos } : undefined;
  }
  return undefined;
};

export interface HyperlinkState {
  activeLinkMark?: LinkToolbarState;
  canInsertLink: boolean;
}

export const stateKey = new PluginKey('hyperlinkPlugin');

export const plugin = (dispatch: Dispatch) =>
  new Plugin({
    state: {
      init(_, state: EditorState): HyperlinkState {
        const canInsertLink = canLinkBeCreatedInRange(
          state.selection.from,
          state.selection.to,
        )(state);
        return {
          canInsertLink,
          activeLinkMark: toState(
            undefined,
            LinkAction.SELECTION_CHANGE,
            state,
          ),
        };
      },
      apply(
        tr,
        pluginState: HyperlinkState,
        oldState,
        newState,
      ): HyperlinkState {
        let state = pluginState;
        const action = tr.getMeta(stateKey) as LinkAction;

        if (tr.docChanged) {
          state = {
            canInsertLink: canLinkBeCreatedInRange(
              newState.selection.from,
              newState.selection.to,
            )(newState),
            activeLinkMark: mapTransactionToState(state.activeLinkMark, tr),
          };
        }

        if (action) {
          state = {
            canInsertLink: state.canInsertLink,
            activeLinkMark: toState(state.activeLinkMark, action, newState),
          };
        }

        if (!oldState.selection.map(tr.doc, tr.mapping).eq(tr.selection)) {
          state = {
            canInsertLink: canLinkBeCreatedInRange(
              newState.selection.from,
              newState.selection.to,
            )(newState),
            activeLinkMark: toState(
              state.activeLinkMark,
              LinkAction.SELECTION_CHANGE,
              newState,
            ),
          };
        }

        if (state !== pluginState) {
          dispatch(stateKey, state);
        }
        return state;
      },
    },
    key: stateKey,
  });
