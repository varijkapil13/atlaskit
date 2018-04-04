// @flow
/* eslint-disable react/sort-comp, react/no-multi-comp */
import React, { Component } from 'react';
import { ThemeProvider } from 'styled-components';
import {
  withAnalyticsEvents,
  withAnalyticsContext,
  createAndFireEvent,
  UIAnalyticsEvent,
} from '@atlaskit/analytics-next';
import { FocusLock, withRenderTarget } from '@atlaskit/layer-manager';
import Layer from '@atlaskit/layer';
import { layers } from '@atlaskit/theme';

import {
  name as packageName,
  version as packageVersion,
} from '../../package.json';

import { getSpotlightTheme } from './theme';
import type {
  ActionsType,
  ComponentType,
  ChildrenType,
  ElementType,
} from '../types';

import {
  Dialog,
  DialogBody,
  FillScreen,
  Heading,
  Image,
} from '../styled/Dialog';

import { TargetOverlay, TargetOuter, TargetInner } from '../styled/Target';
import { Fade } from './Animation';
import Actions from './SpotlightActions';
import withScrollMeasurements from '../hoc/withScrollMeasurements';

type Props = {|
  /** Buttons to render in the footer */
  actions?: ActionsType,
  /** An optional element rendered beside the footer actions */
  actionsBeforeElement?: ElementType,
  /** The elements rendered in the modal */
  children: ChildrenType,
  /** Where the dialog should appear, relative to the contents of the children. */
  dialogPlacement?:
    | 'top left'
    | 'top center'
    | 'top right'
    | 'right top'
    | 'right middle'
    | 'right bottom'
    | 'bottom left'
    | 'bottom center'
    | 'bottom right'
    | 'left top'
    | 'left middle'
    | 'left bottom',
  /** The width of the dialog in pixels. Min 160 - Max 600 */
  dialogWidth?: number,
  /** Optional element rendered below the body */
  footer?: ElementType,
  /** Optional element rendered above the body */
  header?: ElementType,
  /** Heading text rendered above the body */
  heading?: string,
  /** Path to the the your image */
  image?: string,
  /** Whether or not to display a pulse animation around the spotlighted element */
  pulse?: boolean,
  /** The name of the SpotlightTarget */
  target: string,
  /** The background color of the element being highlighted */
  targetBgColor?: string,
  /** Function to fire when a user clicks on the cloned target. The last argument can be used to track analytics, see [analytics-next](/packages/core/analytics-next) for details. */
  targetOnClick?: (
    { event: MouseEvent, target: string },
    analyticsEvent?: UIAnalyticsEvent,
  ) => void,
  /** The border-radius of the element being highlighted */
  targetRadius?: number,
  /** Alternative element to render than the wrapped target */
  targetReplacement?: ComponentType,
|};

type FillProps = {
  in: boolean,
  scrollDistance: number,
  children: ChildrenType,
};

const Fill = (props: FillProps) => <Fade component={FillScreen} {...props} />;

/* eslint-disable react/prop-types, react/no-danger */
const Clone = ({ html }) => (
  <div
    dangerouslySetInnerHTML={{ __html: html }}
    style={{ pointerEvents: 'none' }}
  />
);
/* eslint-enable react/prop-types, react/no-danger */

class Spotlight extends Component<Props> {
  static defaultProps = {
    dialogWidth: 400,
    pulse: true,
  };

  handleTargetClick = (event: MouseEvent) => {
    const { targetOnClick, target } = this.props;

    if (targetOnClick) targetOnClick({ event, target });
  };

  renderTargetClone() {
    // NOTE: `clone` & `rect` are NOT public API
    const {
      // $FlowFixMe
      clone, // eslint-disable-line react/prop-types
      // $FlowFixMe
      rect, // eslint-disable-line react/prop-types
      pulse,
      target,
      targetBgColor,
      targetOnClick,
      targetRadius,
      targetReplacement: Replacement,
    } = this.props;

    if (!target) {
      throw Error(`Spotlight couldn't find a target matching "${target}".`);
    }

    return Replacement ? (
      <Replacement {...rect} />
    ) : (
      <TargetOuter style={rect}>
        <TargetInner
          pulse={pulse}
          bgColor={targetBgColor}
          radius={targetRadius}
          style={rect}
        >
          <Clone html={clone} />
          <TargetOverlay onClick={targetOnClick && this.handleTargetClick} />
        </TargetInner>
      </TargetOuter>
    );
  }

  render() {
    // NOTE: `scrollY` & `in` are NOT public API
    const {
      actions,
      actionsBeforeElement,
      children,
      dialogPlacement,
      dialogWidth,
      footer,
      header,
      heading,
      // $FlowFixMe
      in: transitionIn, // eslint-disable-line react/prop-types
      image,
      // $FlowFixMe
      scrollY, // eslint-disable-line react/prop-types
    } = this.props;

    // warn consumers when they provide conflicting props
    if (header && image) {
      console.warn('Please provide "header" OR "image", not both.'); // eslint-disable-line no-console
    }
    if (footer && actions) {
      console.warn('Please provide "footer" OR "actions", not both.'); // eslint-disable-line no-console
    }

    // prepare header/footer elements
    const headerElement =
      header || (image ? <Image alt={heading} src={image} /> : null);
    const footerElement =
      footer ||
      (actions ? (
        <Actions beforeElement={actionsBeforeElement} items={actions} />
      ) : null);

    // build the dialog before passing it to Layer
    const dialog = (
      <ThemeProvider theme={getSpotlightTheme}>
        <FocusLock enabled={transitionIn} autoFocus>
          <Dialog width={dialogWidth} tabIndex="-1">
            {headerElement}
            {/* // $FlowFixMe TEMPORARY */}
            <DialogBody>
              {/* // $FlowFixMe TEMPORARY */}
              {heading && <Heading>{heading}</Heading>}
              {children}
            </DialogBody>
            {footerElement}
          </Dialog>
        </FocusLock>
      </ThemeProvider>
    );

    return (
      <Fill in={transitionIn} scrollDistance={scrollY}>
        <Layer
          boundariesElement="scrollParent"
          content={dialog}
          offset="0 8"
          position={dialogPlacement}
          // $FlowFixMe TEMPORARY
          zIndex={layers.spotlight(this.props)}
        >
          {this.renderTargetClone()}
        </Layer>
      </Fill>
    );
  }
}

export const SpotlightBase = withScrollMeasurements(
  withRenderTarget(
    {
      target: 'spotlight',
      withTransitionGroup: true,
    },
    // $FlowFixMe TEMPORARY
    Spotlight,
  ),
);

const createAndFireEventOnAtlaskit = createAndFireEvent('atlaskit');

export default withAnalyticsContext({
  component: 'spotlight',
  package: packageName,
  version: packageVersion,
})(
  withAnalyticsEvents({
    targetOnClick: createAndFireEventOnAtlaskit({
      action: 'click',
    }),
  })(SpotlightBase),
);
