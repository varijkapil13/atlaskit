import * as React from 'react';
import { ComponentClass } from 'react';
import * as styles from './styles';

import {
  LoadingEmojiComponent,
  LoadingEmojiProps,
  LoadingEmojiState,
} from '@atlaskit/emoji';
import {
  PickerRefHandler,
  Props as ComponentProps,
} from './EmojiPickerComponent';
import { LoadingItem } from './EmojiPickerVirtualItems';
import { EmojiProvider, OnEmojiEvent } from '@atlaskit/emoji';
import { FireAnalyticsEvent, withAnalytics } from '@atlaskit/analytics';

const emojiPickerModuleLoader = () =>
  import(/* webpackChunkName:"@atlaskit-internal_emojiPickerComponent" */ './EmojiPickerComponent');

const emojiPickerLoader: () => Promise<ComponentClass<ComponentProps>> = () =>
  emojiPickerModuleLoader().then(module => module.default);

export interface Props extends LoadingEmojiProps {
  onSelection?: OnEmojiEvent;
  onPickerRef?: PickerRefHandler;
  hideToneSelector?: boolean;
  firePrivateAnalyticsEvent?: FireAnalyticsEvent;
}

export class EmojiPickerInternal extends LoadingEmojiComponent<
  Props,
  LoadingEmojiState
> {
  // state initialised with static component to prevent
  // rerender when the module has already been loaded
  static AsyncLoadedComponent?: ComponentClass<ComponentProps>;
  state = {
    asyncLoadedComponent: EmojiPickerInternal.AsyncLoadedComponent,
  };

  constructor(props) {
    super(props, {});
  }

  asyncLoadComponent() {
    emojiPickerLoader().then(component => {
      EmojiPickerInternal.AsyncLoadedComponent = component;
      this.setAsyncState(component);
    });
  }

  renderLoading(): JSX.Element | null {
    const item = new LoadingItem();
    const handlePickerRef = (ref: any) => {
      if (this.props.onPickerRef) {
        this.props.onPickerRef(ref);
      }
    };
    return (
      <div className={styles.emojiPicker} ref={handlePickerRef}>
        {item.renderItem()}
      </div>
    );
  }

  renderLoaded(
    loadedEmojiProvider: EmojiProvider,
    EmojiPickerComponent: ComponentClass<ComponentProps>,
  ) {
    const { emojiProvider, ...otherProps } = this.props;
    return (
      <EmojiPickerComponent
        emojiProvider={loadedEmojiProvider}
        {...otherProps}
      />
    );
  }
}

// tslint:disable-next-line:variable-name
const EmojiPicker = withAnalytics<typeof EmojiPickerInternal>(
  EmojiPickerInternal,
  {},
  {},
);
type EmojiPicker = EmojiPickerInternal;

export default EmojiPicker;