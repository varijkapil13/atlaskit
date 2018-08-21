import { EditorProps, EditorAppearance } from '../types';

const messageEditorPropsPreset: EditorProps = {
  appearance: 'message',
  saveOnEnter: true,
  allowTextColor: true,
};

export default function getPropsPreset(
  appearance: EditorAppearance,
): EditorProps {
  switch (appearance) {
    case 'message':
      return { ...messageEditorPropsPreset };
    default:
      return {};
  }
}
