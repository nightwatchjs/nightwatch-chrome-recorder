import { InMemoryLineWriter } from './InMemoryLineWriter.js';
import { NightwatchStringifyExtension } from '../src/nightwatchStringifyExtension.js';
import { expect } from 'chai';
import { Key, StepType, AssertedEventType } from '@puppeteer/replay';

describe('NightwatchStringifyExtension', () => {
  it('should correctly exports setViewport step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.SetViewport as const,
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
      'browser.windowRect({width: 1905, height: 223})\n',
    );
  });

  it('should correctly exports navigate step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.Navigate as const,
      url: 'chrome://new-tab-page/',
      assertedEvents: [
        {
          type: AssertedEventType.Navigation as const,
          url: 'chrome://new-tab-page/',
          title: 'New Tab',
        },
      ],
    };
    const flow = { title: 'navigate step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).to.equal(
      '.navigateTo("chrome://new-tab-page/")\n',
    );
  });

  it('should correctly exports click step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.Click as const,
      target: 'main',
      selectors: ['#test'],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'click step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('.click("#test")\n');
  });

  it('should correctly exports change step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.Change as const,
      value: 'nightwatch',
      selectors: [['aria/Search'], ['#heading']],
      target: 'main',
    };
    const flow = { title: 'change step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('.setValue("#heading", "nightwatch")\n');
  });

  it('should correctly exports keyDown step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.KeyDown as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: AssertedEventType.Navigation as const,
          url: 'https://google.com',
          title: 'nightwatch - Google Search',
        },
      ],
    };
    const flow = { title: 'keyDown step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(
      `.perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyDown(this.Keys.ENTER);
        })\n`,
    );
  });

  it('should handle keyDown step when key is not supported', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.KeyDown as const,
      target: 'main',
      key: 'KEY_DOESNT_EXIST' as Key,
      assertedEvents: [
        {
          type: AssertedEventType.Navigation as const,
          url: 'https://google.com',
          title: 'nightwatch - Google Search',
        },
      ],
    };
    const flow = { title: 'keyDown step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('\n');
  });

  it('should correctly exports keyUp step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.KeyUp as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: AssertedEventType.Navigation as const,
          url: 'https://google.com',
          title: 'nightwatch - Google Search',
        },
      ],
    };
    const flow = { title: 'keyUp step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(
      `.perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyUp(this.Keys.ENTER);
        })\n`,
    );
  });

  it('should correctly exports scroll step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.Scroll as const,
      target: 'main',
      x: 0,
      y: 805,
    };
    const flow = { title: 'scroll step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`.execute('scrollTo(0, 805)')\n`);
  });

  it('should correctly exports doubleClick step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.DoubleClick as const,
      target: 'main',
      selectors: [['aria/Test'], ['#test']],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'doubleClick step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`.doubleClick("#test")\n`);
  });

  it('should correctly exports emulateNetworkConditions step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.EmulateNetworkConditions as const,
      download: 50000,
      upload: 50000,
      latency: 2000,
    };
    const flow = { title: 'emulateNetworkConditions step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
    .setNetworkConditions({
      offline: false,
      latency: 2000,
      download_throughput: 50000,
      upload_throughput: 50000
    })\n`);
  });

  it('should correctly exports waitForElement step if operator is "=="', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.WaitForElement as const,
      selectors: ['#test'],
      operator: '==' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", function(result) {
        if (result.value) {
          browser.expect.elements("#test").count.to.equal(2);
        }
      })\n`);
  });

  it('should correctly exports waitForElement step with timeout', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.WaitForElement as const,
      selectors: ['#test'],
      operator: '==' as const,
      count: 2,
      timeout: 2000,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", 2000, function(result) {
        if (result.value) {
          browser.expect.elements("#test").count.to.equal(2);
        }
      })\n`);
  });

  it('should correctly exports waitForElement step if operator is "<="', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.WaitForElement as const,
      selectors: ['#test'],
      operator: '<=' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", function(result) {
        if (result.value) {
          browser.elements('css selector', "#test", function (result) {
            browser.assert.ok(result.value.length <= 2, 'element count is less than 2');
          });
        }
      })\n`);
  });

  it('should correctly exports waitForElement step if operator is ">="', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.WaitForElement as const,
      selectors: ['#test'],
      operator: '>=' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`
      .waitForElementVisible("#test", function(result) {
        if (result.value) {
          browser.elements('css selector', "#test", function (result) {
            browser.assert.ok(result.value.length >= 2, 'element count is greater than 2');
          });
        }
      })\n`);
  });

  it('should correctly add Hover Step', async () => {
    const ext = new NightwatchStringifyExtension();
    const step = {
      type: StepType.Hover as const,
      selectors: ['#test'],
    };
    const flow = { title: 'Hover step', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal(`.moveToElement("#test", 0, 0)\n`);
  });
});
