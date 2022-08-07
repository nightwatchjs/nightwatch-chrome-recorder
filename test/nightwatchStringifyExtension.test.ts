import { InMemoryLineWriter } from './InMemoryLineWriter.js';
import { NightwatchStringifyExtension } from '../src/nightwatchStringifyExtension.js';
import { expect } from 'chai';
import { Key } from '@puppeteer/replay';

describe('NightwatchStringifyExtension', () => {
  it('should correctly exports setViewport step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'setViewport' as const,
      width: 1905,
      height: 223,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    };
    const flow = { title: 'setViewport step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).to.equal(
      'browser.windowRect({width: 1905, height: 223});\n\n',
    );
  });

  it('should correctly exports navigate step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'navigate' as const,
      url: 'chrome://new-tab-page/',
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'chrome://new-tab-page/',
          title: 'New Tab',
        },
      ],
    };
    const flow = { title: 'navigate step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).to.equal(
      'browser.navigateTo("chrome://new-tab-page/");\n\n',
    );
  });

  it('should correctly exports click step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'click' as const,
      target: 'main',
      selectors: ['aria/Test'],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'click step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('browser.click("a");\n');
  });

  it('should correctly exports change step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'change' as const,
      value: 'nightwatch',
      selectors: [['aria/Search'], ['#heading']],
      target: 'main',
    };
    const flow = { title: 'change step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(
      'browser.setValue("#heading", "nightwatch");\n',
    );
  });

  it('should correctly exports keyDown step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'keyDown' as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'nightwatch - Google Search',
        },
      ],
    };
    const flow = { title: 'keyDown step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
        browser.perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyDown(Keys.ENTER);
        });\n
`);
  });

  it('should correctly exports keyUp step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'keyUp' as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'nightwatch - Google Search',
        },
      ],
    };
    const flow = { title: 'keyUp step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
        browser.perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyUp(Keys.ENTER);
        });\n
`);
  });

  it('should correctly exports scroll step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'scroll' as const,
      target: 'main',
      x: 0,
      y: 805,
    };
    const flow = { title: 'scroll step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(
      `browser.execute('scrollTo(0, 805)');\n\n`,
    );
  });

  it('should correctly exports doubleClick step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'doubleClick' as const,
      target: 'main',
      selectors: [['aria/Test'], ['#test']],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'doubleClick step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`browser.doubleClick("#test");\n`);
  });

  it('should correctly exports emulateNetworkConditions step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'emulateNetworkConditions' as const,
      download: 50000,
      upload: 50000,
      latency: 2000,
    };
    const flow = { title: 'emulateNetworkConditions step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
    browser.setNetworkConditions({
      offline: false,
      latency: 2000,
      download_throughput: 50000,
      upload_throughput: 50000
    });\n`);
  });

  it('should correctly exports waitForElement step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '==' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      browser.waitForElementVisible("#", undefined, function(result) {
        if (result.value) {
          browser.expect.elements("#").count.to.equal(2);
        }
      });\n`);
  });
});
