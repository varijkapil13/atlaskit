import { mount } from 'enzyme';
import * as React from 'react';
import textColorPlugin, { TextColorState } from '../../src/plugins/text-color';
import ToolbarButton from '../../src/ui/ToolbarButton';
import ToolbarTextColor from '../../src/ui/ToolbarTextColor';
import { doc, code_block, p, makeEditor, defaultSchema } from '@atlaskit/editor-test-helpers';
import { analyticsService } from '../../src/analytics';
import EditorWidth from '../../src/utils/editor-width';

describe('ToolbarTextColor', () => {
  const editor = (doc: any) => makeEditor<TextColorState>({
    doc,
    plugins: textColorPlugin(defaultSchema),
  });

  it('should have spacing of toolbar button set to none if editorWidth is less then breakpoint6', () => {
    const { pluginState, editorView } = editor(doc(p('text')));
    const toolbarOption = mount(<ToolbarTextColor pluginState={pluginState} editorView={editorView} editorWidth={EditorWidth.BreakPoint6 - 1} />);
    expect(toolbarOption.find(ToolbarButton).prop('spacing')).toEqual('none');
    toolbarOption.unmount();
  });

  it('should have spacing of toolbar button set to default if editorWidth is greater then breakpoint6', () => {
    const { pluginState, editorView } = editor(doc(p('text')));
    const toolbarOption = mount(<ToolbarTextColor pluginState={pluginState} editorView={editorView} editorWidth={EditorWidth.BreakPoint6 + 1} />);
    expect(toolbarOption.find(ToolbarButton).prop('spacing')).toEqual('default');
    toolbarOption.unmount();
  });

  describe('when plugin is enabled', () => {
    it('sets disabled to false', () => {
      const { editorView, pluginState } = editor(doc(p('text')));
      const toolbarTextColor = mount(
        <ToolbarTextColor
          pluginState={pluginState}
          editorView={editorView}
        />
      );

      expect(toolbarTextColor.state('disabled')).toBe(false);
      toolbarTextColor.unmount();
    });
  });

  describe('when plugin is not enabled', () => {
    it('sets disabled to true', () => {
      const { editorView, pluginState } = editor(doc(code_block()('text')));
      const toolbarTextColor = mount(
        <ToolbarTextColor
          pluginState={pluginState}
          editorView={editorView}
        />
      );

      expect(toolbarTextColor.state('disabled')).toBe(true);
      toolbarTextColor.unmount();
    });
  });

  it('should make isOpen true when toolbar textColor button is clicked', () => {
    const { pluginState, editorView } = editor(doc(p('text')));
    const toolbarTextColor = mount(
      <ToolbarTextColor
        pluginState={pluginState}
        editorView={editorView}
      />
    );

    expect(toolbarTextColor.state('isOpen')).toBe(false);
    toolbarTextColor.find('button').simulate('click');
    expect(toolbarTextColor.state('isOpen')).toBe(true);
    toolbarTextColor.unmount();
  });

  it('should make isOpen false when a color is clicked', () => {
    const { pluginState, editorView } = editor(doc(p('text')));
    const toolbarTextColor = mount(
      <ToolbarTextColor
        pluginState={pluginState}
        editorView={editorView}
      />
    );

    toolbarTextColor.find('button').simulate('click');
    expect(toolbarTextColor.state('isOpen')).toBe(true);
    toolbarTextColor.find('ColorPalette button').first().simulate('click');
    expect(toolbarTextColor.state('isOpen')).toBe(false);
    toolbarTextColor.unmount();
  });

  it('should render disabled ToolbarButton if disabled property is true', () => {
    const { editorView, pluginState } = editor(doc(p('text')));
    const toolbarTextColor = mount(
      <ToolbarTextColor
        disabled={true}
        pluginState={pluginState}
        editorView={editorView}
      />
    );

    expect(toolbarTextColor.find(ToolbarButton).prop('disabled')).toBe(true);
    toolbarTextColor.unmount();
  });

  describe('analytics', () => {
    it('should trigger analyticsService.trackEvent when a color is clicked', () => {
      let trackEvent = jest.fn();
      analyticsService.trackEvent = trackEvent;
      const { editorView, pluginState } = editor(doc(p('text')));
      const toolbarOption = mount(
        <ToolbarTextColor
          pluginState={pluginState}
          editorView={editorView}
        />
      );
      toolbarOption.find('button').simulate('click');
      toolbarOption.find('ColorPalette button').first().simulate('click');
      expect(trackEvent).toHaveBeenCalledWith('atlassian.editor.format.textcolor.button');
      toolbarOption.unmount();
    });
  });
});
