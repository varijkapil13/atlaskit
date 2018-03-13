import * as React from 'react';
import { Component } from 'react';

import { CardAction } from '../../actions';
import { Wrapper } from './styled';
import { CardActionIconButton } from './cardActionIconButton';
import { CardActionsDropdownMenu } from './cardActionsDropdownMenu';
import { PreventClickThrough } from '../preventClickThrough';

export interface CardActionsViewProps {
  readonly actions: CardAction[];

  readonly onToggle?: (attrs: { isOpen: boolean }) => void;
  readonly triggerColor?: string;
}

export class CardActionsView extends Component<CardActionsViewProps> {
  render() {
    const { actions, triggerColor } = this.props;

    if (!actions.length) {
      return null;
    }

    const primaryAction = actions.find(({ icon }) => !!icon);
    const otherActions = actions.filter(action => action !== primaryAction);

    if (primaryAction) {
      const { icon, handler } = primaryAction;
      return (
        <PreventClickThrough>
          <Wrapper>
            <CardActionIconButton
              icon={icon}
              triggerColor={triggerColor}
              onClick={() => handler()}
            />
            {this.renderOtherActionButtons(otherActions)}
          </Wrapper>
        </PreventClickThrough>
      );
    } else {
      return <Wrapper>{this.renderOtherActionButtons(otherActions)}</Wrapper>;
    }
  }

  private renderOtherActionButtons(actions: CardAction[]) {
    if (actions.length === 0) {
      return null;
    } else {
      const primaryAction = actions.find(
        ({ icon }) => icon !== undefined && icon !== null,
      );
      const otherActions = actions.filter(action => action !== primaryAction);
      const { triggerColor, onToggle } = this.props;

      if (primaryAction && otherActions.length === 0) {
        const { icon, handler } = primaryAction;
        return (
          <CardActionIconButton
            icon={icon}
            triggerColor={triggerColor}
            onClick={() => handler()}
          />
        );
      } else {
        return (
          <CardActionsDropdownMenu
            actions={actions}
            triggerColor={triggerColor}
            onOpenChange={onToggle}
          />
        );
      }
    }
  }
}
