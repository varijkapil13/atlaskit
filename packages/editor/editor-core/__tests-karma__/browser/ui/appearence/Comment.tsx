import { expect } from 'chai';
import { mount } from 'enzyme';
import * as React from 'react';
import { ProviderFactory } from '@atlaskit/editor-common';
import Editor from '../../../../src/ui/Appearance/Comment';

describe('@atlaskit/editor-core/editor/plugins/Comment', () => {
  const providerFactory = new ProviderFactory();

  it('should have Editor component defined', () => {
    const editor = mount(
      <Editor editorDOMElement={<div />} providerFactory={providerFactory} />,
    );
    expect(editor).to.not.equal(undefined);
  });
});
