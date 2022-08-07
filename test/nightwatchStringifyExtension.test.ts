import { InMemoryLineWriter } from './InMemoryLineWriter.js';
import { NightwatchStringifyExtension } from '../src/nightwatchStringifyExtension.js';
import { expect } from 'chai';

describe('NightwatchStringifyExtension', () => {
  const ext = new NightwatchStringifyExtension();

  it('should print the correct script for a click step', async () => {
    const step = {
      type: 'click' as const,
      target: 'main',
      selectors: ['aria/Test'],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'test', steps: [step] };

    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);

    expect(writer.toString()).to.equal('browser.click("a")\n');
  });
});
