import WikiMarkupTransformer from '../src';

// @TODO These aren't link tests..?
describe.skip('JIRA wiki markup - Links', () => {
  const testCases: [string, string][] = [
    [
      'should find mentions in wiki markup',
      'This is a string with a *strong text with a [~dsorin] mention*.',
    ],
    [
      'should divide marks intervals into combination of marks',
      'This is a *string with a {color:red}bold red* text{color}.',
    ],
    ['should find monospace text', 'This is a string with {{monospaced text}}'],
    [
      'should not search for monospace text inside code macro',
      'This is a string with {code}mono {{space}} text{code}',
    ],
    [
      'should process string with a wrong order of effects',
      'This is a *strong ^string* with a ~^bla*~~',
    ],
    [
      'should convert double baskslash to a hardBreak node',
      'this is a text with a\\\\new line in it',
    ],
    [
      'should not fail while applying marks to a string containing double backslash',
      'this is a text *with a\\\\new* line in it',
    ],
    [
      'should not apply marks on separate lines',
      `this is a line with an *asterisk
another one is here and it should* not be applied`,
    ],
    [
      "should use code mark first if it's the outer mark",
      'This is a {{monospace *bold* thingy}}',
    ],
    [
      "should use code mark first if it's the inner mark",
      'This is a *bold {{monospace}} thingy*',
    ],
  ];

  for (const [testCaseDescription, markup] of testCases) {
    it(testCaseDescription, () => {
      const transformer = new WikiMarkupTransformer();
      expect(transformer.parse(markup)).toMatchSnapshot();
    });
  }
});
