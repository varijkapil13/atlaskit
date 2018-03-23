import { defaultSchema } from '@atlaskit/editor-common';
import AbstractTree from '../../src/parser/abstract-tree';

describe('JIRA wiki markup - Abstract tree', () => {
  const testCases: [string, string][] = [
    ['simple quote wrapper string', '{quote}simple quote{quote}'],
    ['simple quote string', 'This is a {quote}simple quote{quote}'],
    [
      'multiple quotes containing string',
      'This is a {quote}quote1{quote}{quote}quote2{quote}',
    ],
    ['simple code containing string', 'This is a {code:xml}<xml_code/>{code}'],
    [
      'noformat example',
      'This is a {noformat}no format thing with {code}inside{code}{noformat}',
    ],
    [
      'quote example with a panel inside',
      'This is a {quote}quote with a {panel}panel{panel} inside{quote}.',
    ],
    [
      'panel with attributes and a nested quote',
      '{panel:title=My Title|borderStyle=dashed}{quote}Panel with nested quote here{quote}{panel}.',
    ],
    [
      'string with a wrong order of macros',
      'This is a {panel:foo=bar} panel with a {quote}quote inside{panel} but it is broken{quote}',
    ],
    [
      'string with heading in it',
      `
This is a string.
h1. Boom! this is a heading with *bold* text in it
      `,
    ],
  ];

  for (const [testCaseName, markup] of testCases) {
    it(`should match parsed structure for ${testCaseName}`, () => {
      const tree = new AbstractTree(defaultSchema, markup);
      console.log(JSON.stringify(tree.getTextIntervals(), null, 2));

      // expect(tree.getTextIntervals()).toMatchSnapshot();
    });
  }

  it('should process lists correctly', () => {
    const markup = `* foo
** bar
*** baz
### 1baz
## 2bar`;
    const tree = new AbstractTree(defaultSchema, markup);
    console.log(JSON.stringify(tree.getProseMirrorModel().toJSON(), null, 2));
  });
});
