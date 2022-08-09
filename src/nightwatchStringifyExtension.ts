import {
  PuppeteerStringifyExtension,
  LineWriter,
  Step,
  UserFlow,
  NavigateStep,
  SetViewportStep,
  ClickStep,
  ChangeStep,
  KeyDownStep,
  KeyUpStep,
  ScrollStep,
  DoubleClickStep,
  EmulateNetworkConditionsStep,
  WaitForElementStep,
  Selector,
} from '@puppeteer/replay';
import { SupportedKeys, DowncaseKeys } from './types.js';

export class NightwatchStringifyExtension extends PuppeteerStringifyExtension {
  #formatAsJSLiteral(value: string) {
    return JSON.stringify(value);
  }

  async beforeAllSteps(out: LineWriter, flow: UserFlow): Promise<void> {
    out.appendLine(`describe(${this.#formatAsJSLiteral(flow.title)}, () => {`);
    out
      .appendLine(
        `it(${this.#formatAsJSLiteral(`tests ${flow.title}`)}, () => {`,
      )
      .startBlock();
  }

  async afterAllSteps(out: LineWriter): Promise<void> {
    out.appendLine('});').endBlock();
    out.appendLine('});');
  }

  async stringifyStep(
    out: LineWriter,
    step: Step,
    flow: UserFlow,
  ): Promise<void> {
    this.#appendStepType(out, step, flow);
  }

  #appendStepType(out: LineWriter, step: Step, flow: UserFlow): void {
    switch (step.type) {
      case 'setViewport':
        return this.#appendViewportStep(out, step);
      case 'navigate':
        return this.#appendNavigateStep(out, step);
      case 'click':
        return this.#appendClickStep(out, step, flow);
      case 'change':
        return this.#appendChangeStep(out, step, flow);
      case 'keyDown':
        return this.#appendKeyDownStep(out, step);
      case 'keyUp':
        return this.#appendKeyUpStep(out, step);
      case 'scroll':
        return this.#appendScrollStep(out, step, flow);
      case 'doubleClick':
        return this.#appendDoubleClickStep(out, step, flow);
      case 'emulateNetworkConditions':
        return this.#appendEmulateNetworkConditionsStep(out, step);
      case 'waitForElement':
        return this.#appendWaitForElementStep(out, step, flow);
      default:
        return this.logStepsNotImplemented(step);
    }
  }

  #appendNavigateStep(out: LineWriter, step: NavigateStep): void {
    out.appendLine(`.navigateTo(${this.#formatAsJSLiteral(step.url)})`);
  }

  #appendViewportStep(out: LineWriter, step: SetViewportStep): void {
    out.appendLine(
      `browser.windowRect({width: ${step.width}, height: ${step.height}})`,
    );
  }

  #appendClickStep(out: LineWriter, step: ClickStep, flow: UserFlow): void {
    const domSelector = this.getSelector(step.selectors, flow);

    const hasRightButton = step.button && step.button === 'secondary';
    if (domSelector) {
      hasRightButton
        ? out.appendLine(`.rightClick(${domSelector})`)
        : out.appendLine(`.click(${domSelector})`);
    } else {
      console.log(
        `Warning: The click on ${step.selectors} was not able to export to Nightwatch. Please adjust selectors and try again`,
      );
    }
  }

  #appendChangeStep(out: LineWriter, step: ChangeStep, flow: UserFlow): void {
    const domSelector = this.getSelector(step.selectors, flow);
    if (domSelector) {
      out.appendLine(
        `.setValue(${domSelector}, ${this.#formatAsJSLiteral(step.value)})`,
      );
    }
  }

  #appendKeyDownStep(out: LineWriter, step: KeyDownStep): void {
    const pressedKey = step.key.toLowerCase() as DowncaseKeys;

    if (pressedKey in SupportedKeys) {
      const keyValue = SupportedKeys[pressedKey];
      out.appendLine(`
        .perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyDown(Keys.${keyValue});
        })
      `);
    }
  }

  #appendKeyUpStep(out: LineWriter, step: KeyUpStep): void {
    const pressedKey = step.key.toLowerCase() as DowncaseKeys;

    if (pressedKey in SupportedKeys) {
      const keyValue = SupportedKeys[pressedKey];
      out.appendLine(`
        .perform(function() {
          const actions = this.actions({async: true});

          return actions
          .keyUp(Keys.${keyValue});
        })
      `);
    }
  }

  #appendScrollStep(out: LineWriter, step: ScrollStep, flow: UserFlow): void {
    if ('selectors' in step) {
      const domSelector = this.getSelector(step.selectors, flow);
      out.appendLine(`.moveToElement(${domSelector}, 0, 0)`);
    } else {
      out.appendLine(`.execute('scrollTo(${step.x}, ${step.y})')`);
    }
  }

  #appendDoubleClickStep(
    out: LineWriter,
    step: DoubleClickStep,
    flow: UserFlow,
  ): void {
    const domSelector = this.getSelector(step.selectors, flow);

    if (domSelector) {
      out.appendLine(`.doubleClick(${domSelector})`);
    } else {
      console.log(
        `Warning: The click on ${step.selectors} was not able to be exported to Nightwatch. Please adjust your selectors and try again.`,
      );
    }
  }

  #appendEmulateNetworkConditionsStep(
    out: LineWriter,
    step: EmulateNetworkConditionsStep,
  ): void {
    out.appendLine(`
    .setNetworkConditions({
      offline: false,
      latency: ${step.latency},
      download_throughput: ${step.download},
      upload_throughput: ${step.upload}
    })`);
  }

  #appendWaitForElementStep(
    out: LineWriter,
    step: WaitForElementStep,
    flow: UserFlow,
  ): void {
    const domSelector = this.getSelector(step.selectors, flow);

    if (domSelector) {
      out.appendLine(`
      .waitForElementVisible(${domSelector}, ${step.timeout}, function(result) {
        if (result.value) {
          browser.expect.elements(${domSelector}).count.to.equal(${step.count});
        }
      })
      `);
    } else {
      console.log(
        `Warning: The WaitForElement on ${step.selectors} was not able to be exported to Nightwatch. Please adjust your selectors and try again.`,
      );
    }
  }

  getSelector(selectors: Selector[], flow: UserFlow): string | undefined {
    // Remove Aria selectors
    const nonAriaSelectors = this.filterArrayByString(selectors, 'aria/');

    let preferredSelector;

    // Give preference to user selector
    if (flow.selectorAttribute) {
      preferredSelector = this.filterArrayByString(
        nonAriaSelectors,
        flow.selectorAttribute,
      );
    }

    if (preferredSelector && preferredSelector[0]) {
      return `${this.#formatAsJSLiteral(preferredSelector[0][0])}`;
    } else {
      return `${this.#formatAsJSLiteral(nonAriaSelectors[0][0])}`;
    }
  }

  filterArrayByString(selectors: Selector[], filterValue: string): Selector[] {
    return selectors.filter((selector) =>
      filterValue === 'aria/'
        ? !selector[0].includes(filterValue)
        : selector[0].includes(filterValue),
    );
  }

  logStepsNotImplemented(step: Step): void {
    console.log(
      `Warning: Nightwatch Chrome Recorder does not handle migration of types ${step.type}.`,
    );
  }
}
