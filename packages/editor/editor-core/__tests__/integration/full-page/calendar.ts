import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import Page from '@atlaskit/webdriver-runner/wd-wrapper';
import { getExampleUrl } from '@atlaskit/webdriver-runner/utils/example';

const fullPageEditor = getExampleUrl('editor', 'editor-core', 'full-page');
const editorSelector = '.ProseMirror';

// https://product-fabric.atlassian.net/browse/ED-4531
BrowserTestCase(
  'user should be able to open calendar',
  { skip: ['edge', 'ie', 'safari'] },
  async client => {
    const insertMenu = '[aria-label="Open or close insert block dropdown"]';
    const dateMenu = 'span=Date';
    const calendar = '[aria-label="calendar"]';

    const browser = await new Page(client);

    await browser.goto(fullPageEditor);
    await browser.waitForSelector(editorSelector);
    await browser.click(editorSelector);
    await browser.click(insertMenu);
    await browser.click(dateMenu);
    await browser.waitForSelector(calendar);
    expect(await browser.isExisting(calendar)).toBe(true);
    await browser.click(editorSelector);
    expect(await browser.isExisting(calendar)).toBe(false);
  },
);

// https://product-fabric.atlassian.net/browse/ED-5033
BrowserTestCase(
  'clicking date when calendar is open should close it',
  { skip: ['edge', 'ie', 'safari'] },
  async client => {
    const insertMenu = '[aria-label="Open or close insert block dropdown"]';
    const dateMenu = 'span=Date';
    const calendar = '[aria-label="calendar"]';
    const dateView = `span.dateView-content-wrap`;

    const browser = await new Page(client);

    await browser.goto(fullPageEditor);
    await browser.waitForSelector(editorSelector);
    await browser.click(editorSelector);
    await browser.click(insertMenu);
    await browser.click(dateMenu);
    await browser.waitForSelector(calendar);
    expect(await browser.isExisting(calendar)).toBe(true);
    await browser.waitForSelector(dateView);
    await browser.click(dateView);
    expect(await browser.isExisting(calendar)).toBe(false);
  },
);

BrowserTestCase(
  'clicking on another date should open its date picker',
  { skip: ['edge', 'ie', 'safari'] },
  async client => {
    const insertMenu = '[aria-label="Open or close insert block dropdown"]';
    const dateMenu = 'span=Date';
    const calendar = '[aria-label="calendar"]';
    const dateView = `span.dateView-content-wrap`;

    const browser = await new Page(client);

    await browser.goto(fullPageEditor);
    await browser.waitForSelector(editorSelector);
    await browser.click(editorSelector);
    await browser.click(insertMenu);
    await browser.click(dateMenu);
    expect(await browser.isExisting(calendar)).toBe(true);

    await browser.type(editorSelector, ['ArrowRight', 'ArrowRight']);
    await browser.click(insertMenu);
    await browser.click(dateMenu);
    expect(await browser.isExisting(calendar)).toBe(true);

    await browser.waitForSelector(dateView);
    await browser.click(dateView);
    expect(await browser.isExisting(calendar)).toBe(true);
  },
);
