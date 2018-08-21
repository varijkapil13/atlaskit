import {
  createEditor,
  doc,
  ol,
  li,
  p,
  hardBreak,
  date,
} from '@atlaskit/editor-test-helpers';
import { enterKeyCommand } from '../../../src/plugins/lists/commands';

describe('enterKeyCommand', () => {
  it("should outdent a list when list item doesn't have any visible content", () => {
    const { editorView } = createEditor({
      doc: doc(ol(li(p('text')), li(p('{<>}', hardBreak())))),
    });
    enterKeyCommand(editorView.state, editorView.dispatch);
    expect(editorView.state.doc).toEqualDocument(
      doc(ol(li(p('text'))), p('', hardBreak())),
    );
  });

  it('should not outdent a list when list item has visible content', () => {
    const timestamp = Date.now();
    const { editorView } = createEditor({
      doc: doc(
        ol(li(p('text')), li(p('{<>}', hardBreak(), date({ timestamp })))),
      ),
      editorProps: { allowDate: true },
    });
    enterKeyCommand(editorView.state, editorView.dispatch);
    expect(editorView.state.doc).toEqualDocument(
      doc(
        ol(
          li(p('text')),
          li(p('')),
          li(p('', hardBreak(), date({ timestamp }))),
        ),
      ),
    );
  });
});
