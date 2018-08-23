import * as React from 'react';
import { ComponentClass, HTMLAttributes } from 'react';
import styled from 'styled-components';

import {
  akEditorFullPageMaxWidth,
  ExtensionHandlers,
} from '@atlaskit/editor-common';
import SizeDetector from '@atlaskit/size-detector';

import { BreakoutProvider } from '../src';
import { default as Renderer } from '../src/ui/Renderer';
import {
  EDITOR_APPS_EXTENSION_TYPE,
  POLL_EXTENSION_KEY,
  PollApp,
} from '../../editor-core/apps/Poll';
import { exampleDocument } from '../../editor-core/apps/Poll/document';

const Wrapper: ComponentClass<HTMLAttributes<HTMLDivElement>> = styled.div`
  max-width: ${akEditorFullPageMaxWidth}px;
  margin: 0 auto;
`;

const extensionHandlers: ExtensionHandlers = {
  [EDITOR_APPS_EXTENSION_TYPE]: (ext, doc) => {
    const { extensionKey, parameters } = ext;

    if (extensionKey === POLL_EXTENSION_KEY) {
      return <PollApp {...parameters} />;
    }

    return null;
  },
};

export default function Example() {
  return (
    <SizeDetector
      containerStyle={{
        height: 0,
        borderStyle: 'none',
      }}
    >
      {({ width }) => (
        <BreakoutProvider value={width}>
          <Wrapper>
            <Renderer
              document={exampleDocument}
              extensionHandlers={extensionHandlers}
            />
          </Wrapper>
        </BreakoutProvider>
      )}
    </SizeDetector>
  );
}