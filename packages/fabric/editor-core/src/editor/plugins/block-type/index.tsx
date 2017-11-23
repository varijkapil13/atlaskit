import { heading, blockquote, rule, hardBreak } from '@atlaskit/editor-common';
import { EditorPlugin } from '../../types';
import { plugin } from '../../../plugins/block-type';
import inputRulePlugin from '../../../plugins/block-type/input-rule';

const blockType: EditorPlugin = {
  nodes() {
    return [
      { name: 'heading', node: heading, rank: 600 },
      { name: 'blockquote', node: blockquote, rank: 700 },
      { name: 'rule', node: rule, rank: 1000 },
      { name: 'hardBreak', node: hardBreak, rank: 1500 }
    ];
  },

  pmPlugins() {
    return [
      { rank: 500, plugin: () => plugin },
      { rank: 510, plugin: schema => inputRulePlugin(schema) }
    ];
  },

  primaryToolbarComponent(editorView, eventDispatcher, providerFactory, appearance, popupsMountPoint, popupsBoundariesElement, disabled) {
    return null;
    // return (
    //   <ToolbarBlockType
    //     isDisabled={disabled}
    //     editorView={editorView}
    //     pluginState={pluginState}
    //     popupsMountPoint={popupsMountPoint}
    //     popupsBoundariesElement={popupsBoundariesElement}
    //   />
    // );
  }
};

export default blockType;
