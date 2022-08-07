import chalk from 'chalk';
import { readFileSync } from 'fs';
import * as path from 'path';
import { nightwatchStringifyChromeRecording } from '../main.js';
import { Flags } from '../types';

const __dirname = path.resolve(path.dirname('.'));

export function runTransformsOnChromeRecording({
  files,
  outputPath,
  flags,
}: {
  files: string[];
  outputPath: string;
  flags: Flags;
}) {
  const outputFolder = path.join(__dirname, outputPath);
  const { dry, output } = flags;

  return files.map(async (file) => {
    console.log(chalk.green(`Running Nightwatch Chrome Recorder on ${file}\n`));

    const recordingContent = readFileSync(file, 'utf-8');
    const stringifiedFile = await nightwatchStringifyChromeRecording(
      recordingContent,
    );

    if (!stringifiedFile) {
      return;
    }

    if (dry) {
      console.log(stringifiedFile);
    }

    return recordingContent;
  });
}
