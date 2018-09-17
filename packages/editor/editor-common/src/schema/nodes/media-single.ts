import { NodeSpec, Node } from 'prosemirror-model';
import { MediaDefinition as Media } from './media';

export type Layout =
  | 'wrap-right'
  | 'center'
  | 'wrap-left'
  | 'wide'
  | 'full-width';

/**
 * @name mediaSingle_node
 */
export interface MediaSingleDefinition {
  type: 'mediaSingle';
  /**
   * @minItems 1
   * @maxItems 1
   */
  content: Array<Media>;
  attrs?: MediaSingleAttributes;
}
export interface MediaSingleAttributes {
  /**
   * @stage 0
   */
  width?: number;
  layout: Layout;
}

export const defaultAttrs = {
  width: { default: null },
  layout: { default: 'center' },
};

export const mediaSingle: NodeSpec = {
  inline: false,
  group: 'block',
  content: 'media',
  attrs: defaultAttrs,
  parseDOM: [
    {
      tag: 'div[data-node-type="mediaSingle"]',
      getAttrs: (dom: HTMLElement) => ({
        layout: dom.getAttribute('data-layout') || 'center',
        width: Number(dom.getAttribute('data-width')) || null,
      }),
    },
  ],
  toDOM(node: Node) {
    const { layout, width } = node.attrs;
    const attrs = {
      'data-node-type': 'mediaSingle',
      'data-layout': layout,
      'data-width': width,
    };
    return ['div', attrs, 0];
  },
};
