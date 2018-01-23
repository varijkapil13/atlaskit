import { akColorN20, akColorN50 } from '@atlaskit/util-shared-styles';
import { createTag, serializeStyle } from '../util';
import { NodeSerializerOpts } from '../interfaces';

const css = serializeStyle({
  'background-color': akColorN20,
  'background-clip': 'padding-box',
  border: `1px solid ${akColorN50}`,
  'border-right-width': 0,
  'border-bottom-width': 0,
  'font-weight': 'bold',
  height: '2.5em',
  'min-width': '3em',
  padding: '6px 10px',
  'text-align': 'left',
  'vertical-align': 'top',
});

export default function tableHeader({ text }: NodeSerializerOpts) {
  return createTag('th', { style: css }, text);
}
