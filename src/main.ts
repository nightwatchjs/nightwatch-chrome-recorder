import { parse, Schema, stringify, stringifyStep } from '@puppeteer/replay';
import { NightwatchStringifyExtension } from './nightwatchStringifyExtension.js';

export function parseRecordingContent(
  recordingContent: string,
): Schema.UserFlow {
  return parse(JSON.parse(recordingContent));
}

export async function transformParsedRecording(
  parsedRecording: Schema.UserFlow,
) {
  return await stringify(parsedRecording, {
    extension: new NightwatchStringifyExtension(),
  });
}

export async function stringifyParsedStep(step: Schema.Step): Promise<string> {
  return await stringifyStep(step, {
    extension: new NightwatchStringifyExtension(),
  });
}

export async function nightwatchStringifyChromeRecording(
  recording: string,
): Promise<Promise<string> | undefined> {
  if (recording.length === 0) {
    console.log(
      `No recording found. Please create and upload before trying again`,
    );
    return;
  }

  const parsedRecording = parseRecordingContent(recording);

  return await transformParsedRecording(parsedRecording);
}
