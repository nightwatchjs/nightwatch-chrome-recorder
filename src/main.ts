import chalk from 'chalk';
import { parse, Schema, stringify } from '@puppeteer/replay';
import { NightwatchStringifyExtension } from './nightwatchStringifyExtension.js';
import prettier from 'prettier';

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

export function formatParsedRecordingContent(
  transformedRecordingContent: string,
): string {
  return prettier.format(transformedRecordingContent, {
    semi: true,
    singleQuote: true,
    parser: 'babel',
  });
}

export async function nightwatchStringifyChromeRecording(
  recording: string,
): Promise<Promise<string> | undefined> {
  if (recording.length === 0) {
    console.log(
      chalk.yellow(
        `No recording found. Please create and upload before trying again`,
      ),
    );
    return;
  }

  const parsedRecording = parseRecordingContent(recording);

  return formatParsedRecordingContent(
    await transformParsedRecording(parsedRecording),
  );
}
