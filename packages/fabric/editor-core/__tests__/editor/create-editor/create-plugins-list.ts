jest.mock('../../../src/editor/plugins', () => ({
  mediaPlugin: jest.fn(),
  insertBlockPlugin: jest.fn(),
  placeholderTextPlugin: jest.fn(),
  extensionPlugin: jest.fn(),
}));

import {
  tablePlugin,
  mediaPlugin,
  extensionPlugin,
  helpDialogPlugin,
  fakeTextCursorPlugin,
  submitEditorPlugin,
  insertBlockPlugin,
  placeholderTextPlugin,
} from '../../../src/editor/plugins';

import createPluginsList from '../../../src/editor/create-editor/create-plugins-list';

describe('createPluginsList', () => {
  beforeEach(() => {
    (insertBlockPlugin as any).mockReset();
    (placeholderTextPlugin as any).mockReset();
  });

  it('should add helpDialogPlugin if allowHelpDialog is true', () => {
    const plugins = createPluginsList({ allowHelpDialog: true });
    expect(plugins).toContain(helpDialogPlugin);
  });

  it('should add fakeTextCursorPlugin by default', () => {
    const plugins = createPluginsList({});
    expect(plugins).toContain(fakeTextCursorPlugin);
  });

  it('should add tablePlugin if allowTables is true', () => {
    const plugins = createPluginsList({ allowTables: true });
    expect(plugins).toContain(tablePlugin);
  });

  it('should always add submitEditorPlugin to the editor', () => {
    const plugins = createPluginsList({});
    expect(plugins).toContain(submitEditorPlugin);
  });

  it('should add mediaPlugin if media prop is provided', () => {
    const media = {
      provider: Promise.resolve() as any,
      allowMediaSingle: true,
    };
    createPluginsList({ media });
    expect(mediaPlugin).toHaveBeenCalledTimes(1);
    expect(mediaPlugin).toHaveBeenCalledWith(media);
  });

  it('should add placeholderText plugin if allowTemplatePlaceholders prop is provided', () => {
    (placeholderTextPlugin as any).mockReturnValue('placeholderText');
    const plugins = createPluginsList({ allowTemplatePlaceholders: true });
    expect(plugins).toContain('placeholderText');
  });

  it('should pass empty options to placeholderText plugin if allowTemplatePlaceholders is true', () => {
    createPluginsList({ allowTemplatePlaceholders: true });
    expect(placeholderTextPlugin).toHaveBeenCalledTimes(1);
    expect(placeholderTextPlugin).toHaveBeenCalledWith({});
  });

  it('should enable allowInserting for placeholderText plugin if options.allowInserting is true', () => {
    createPluginsList({ allowTemplatePlaceholders: { allowInserting: true } });
    expect(placeholderTextPlugin).toHaveBeenCalledTimes(1);
    expect(placeholderTextPlugin).toHaveBeenCalledWith({
      allowInserting: true,
    });
  });

  it('should always add insertBlockPlugin to the editor with insertMenuItems', () => {
    const customItems = [
      {
        content: 'a',
        value: { name: 'a' },
        tooltipDescription: 'item a',
        tooltipPosition: 'right',
        onClick: () => {},
      },
      {
        content: 'b',
        value: { name: 'b' },
        tooltipDescription: 'item b',
        tooltipPosition: 'right',
        onClick: () => {},
      },
    ];

    const props = { insertMenuItems: customItems };

    createPluginsList(props);
    expect(insertBlockPlugin).toHaveBeenCalledTimes(1);
    expect(insertBlockPlugin).toHaveBeenCalledWith(props);
  });

  it('should add extensionPlugin if allowExtension prop is provided', () => {
    const props: any = {
      allowExtension: true,
      extensionHandlers: () => {},
    };

    createPluginsList(props);
    expect(extensionPlugin).toHaveBeenCalledTimes(1);
    expect(extensionPlugin).toHaveBeenCalledWith({
      extensionHandlers: props.extensionHandlers,
    });
  });
});
