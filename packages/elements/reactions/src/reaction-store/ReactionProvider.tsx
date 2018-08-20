import * as React from 'react';
import { ReactionAdapter } from '../adapter/ReactionAdapter';
import { ReactionServiceAdapter } from '../adapter/ReactionServiceAdapter';
import { Reactions } from '../types/Reactions';
import { ReactionsReadyState, ReactionsState } from '../types/ReactionsState';
import { ReactionStatus } from '../types/ReactionStatus';
import { ReactionSummary } from '../types/ReactionSummary';
import { Updater } from '../types/Updater';
import { batchByKey } from './batched';
import { Actions, ReactionsContext } from './ReactionsContext';
import * as utils from './utils';

const getAdapter = ({ adapter, url }: Props): ReactionAdapter => {
  if (adapter) {
    return adapter;
  }
  if (url) {
    return new ReactionServiceAdapter(url);
  }
  throw new Error('Missing adapter');
};

export type State = {
  reactions: {};
  flash: {};
};

export type Props = {
  adapter?: ReactionAdapter;
  url?: string;
};

export class ReactionStore extends React.Component<Props, State> {
  private adapter: ReactionAdapter;
  private actions: Actions;

  constructor(props: Props) {
    super(props);
    this.state = {
      reactions: {},
      flash: {},
    };
    this.adapter = getAdapter(props);
    this.actions = {
      getReactions: this.getReactions,
      toggleReaction: this.toggleReaction,
      addReaction: this.addReaction,
      getDetailedReaction: this.getDetailedReaction,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { adapter, url } = this.props;
    if (prevProps.adapter !== adapter || prevProps.url !== url) {
      this.adapter = getAdapter(this.props);
    }
  }

  private setReactions = (
    containerAri: string,
    ari: string,
    reactions: ReactionsState,
  ) => {
    this.setState({
      reactions: {
        ...this.state.reactions,
        [`${containerAri}|${ari}`]: reactions,
      },
    });
  };

  private getReactionsState(containerAri: string, ari: string) {
    return this.state.reactions[`${containerAri}|${ari}`];
  }

  private handleDetailedReactionResponse = (
    detailedReaction: ReactionSummary,
  ) => {
    const { containerAri, ari, emojiId } = detailedReaction;
    this.withReaction(reaction => ({
      ...reaction,
      users: detailedReaction.users,
    }))(containerAri, ari, emojiId);
  };

  private setFlash(
    containerAri: string,
    ari: string,
    emojiId: string,
    flash: boolean,
  ) {
    this.setState({
      flash: {
        ...this.state.flash,
        [`${containerAri}|${ari}`]: {
          ...this.state.flash[`${containerAri}|${ari}`],
          [emojiId]: flash,
        },
      },
    });
  }

  private flash = (reaction: ReactionSummary): void => {
    this.setFlash(reaction.containerAri, reaction.ari, reaction.emojiId, true);
    setTimeout(
      () =>
        this.setFlash(
          reaction.containerAri,
          reaction.ari,
          reaction.emojiId,
          false,
        ),
      700,
    );
  };

  private optmisticUpdate = (
    containerAri: string,
    ari: string,
    emojiId: string,
  ) => (updater: Updater<ReactionSummary>) => {
    this.withReadyReaction(containerAri, ari)(reactionState => {
      let found = false;
      const reactions = reactionState.reactions.map(reaction => {
        if (reaction.emojiId === emojiId) {
          found = true;
          const updated = updater(reaction);
          if (updated) {
            return {
              ...updated,
              optimisticallyUpdated: true,
            };
          }
        }
        return reaction;
      });

      if (!found) {
        const updated = updater({
          containerAri,
          ari,
          emojiId,
          count: 0,
          reacted: false,
        });
        if (updated) {
          reactions.push({
            ...updated,
            optimisticallyUpdated: true,
          });
        }
      }

      return utils.readyState(reactions);
    });
  };

  /**
   * Utility function to help execute a callback to Reaction if its state is ready.
   *
   *
   * @param containerAri
   * @param ari
   *
   * @returns (updater: Updater<ReactionsReadyState>) => ReactionsState?
   *  A function that will execute the received callback with the ReactionsState if
   *  ready. If some state is returned, the new state will be applied.
   */
  private withReadyReaction(containerAri: string, ari: string) {
    return (updater: Updater<ReactionsReadyState>) => {
      const reactionsState = this.getReactionsState(containerAri, ari);
      if (reactionsState.status === ReactionStatus.ready) {
        const updated = updater(reactionsState);
        if (updated) {
          this.setReactions(containerAri, ari, updated);
        }
      }
    };
  }

  /**
   * Utility function to help execute actions with a reaction. It handles reaction discovery
   * and branching between reacted and not reacted.
   *
   * @param reactedCallback callback that will be executed when the user has already reacted
   * with the emoji
   * @param notReactedCallback callback that will be executed when the user hasn't reacted
   * with the emoji
   *
   * @returns (containerAri: string, ari: string, emojiId: string) => ReactionsState?
   *  A function that will execute the correct callback to the triple containerAri, ari and
   *  emojiId. If some state is returned, the new state will be applied.
   */
  private withReaction(
    reactedCallback: Updater<ReactionSummary>,
    notReactedCallback?: Updater<ReactionSummary>,
  ) {
    return (containerAri: string, ari: string, emojiId: string) => {
      this.withReadyReaction(containerAri, ari)(reactionsState => {
        const reaction: ReactionSummary = reactionsState.reactions.find(
          utils.byEmojiId(emojiId),
        ) || {
          containerAri,
          ari,
          emojiId,
          count: 0,
          reacted: false,
        };
        const callback: Updater<ReactionSummary> =
          reaction.reacted || !notReactedCallback
            ? reactedCallback
            : notReactedCallback;
        const updatedReaction = callback(reaction);
        if (updatedReaction) {
          return utils.readyState(
            reactionsState.reactions.map(
              utils.updateByEmojiId(emojiId, updatedReaction),
            ),
          );
        }
      });
    };
  }

  private doAddReaction = (reaction: ReactionSummary) => {
    const { containerAri, ari, emojiId } = reaction;
    this.optmisticUpdate(containerAri, ari, emojiId)(utils.addOne);
    this.flash(reaction);
    this.adapter.addReaction(containerAri, ari, emojiId);
  };

  private doRemoveReaction = (reaction: ReactionSummary) => {
    const { containerAri, ari, emojiId } = reaction;
    this.optmisticUpdate(containerAri, ari, emojiId)(utils.removeOne);
    this.adapter.deleteReaction(containerAri, ari, emojiId);
  };

  getReactions = batchByKey((containerAri: string, aris: string[][]): void => {
    this.adapter
      .getReactions(containerAri, aris.reduce(utils.flattenAris))
      .then((value: Reactions) => {
        Object.keys(value).map(ari => {
          const reactionsState = this.getReactionsState(containerAri, ari);
          const reactions =
            reactionsState && reactionsState.status === ReactionStatus.ready
              ? reactionsState.reactions
              : undefined;
          this.setReactions(
            containerAri,
            ari,
            utils.readyState(
              value[ari].sort(utils.getReactionsSortFunction(reactions)),
            ),
          );
        });
      });
  });

  toggleReaction = this.withReaction(this.doRemoveReaction, this.doAddReaction);
  addReaction = this.withReaction(this.flash, this.doAddReaction);

  getDetailedReaction = (
    containerAri: string,
    ari: string,
    emojiId: string,
  ): void => {
    this.adapter
      .getDetailedReaction(containerAri, ari, emojiId)
      .then(this.handleDetailedReactionResponse);
  };

  render() {
    return (
      <ReactionsContext.Provider
        value={{
          value: this.state,
          actions: this.actions,
        }}
      >
        {this.props.children}
      </ReactionsContext.Provider>
    );
  }
}
