import chalk from 'chalk';
import { readFileSync, writeFile, mkdir, existsSync } from 'fs';
import * as path from 'path';
import { nightwatchStringifyChromeRecording } from '../main.js';
import { ExportToFile, Flags } from '../types.js';

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
  const { dry } = flags;

  return files.map(async (file) => {
    console.log(
      chalk.green(`🦉 Running Nightwatch  Chrome Recorder on ${file}\n`),
    );

    const recordingContent = readFileSync(file, 'utf-8');
    const stringifiedFile = await nightwatchStringifyChromeRecording(
      recordingContent,
    );

    if (!stringifiedFile) {
      return;
    }

    const fileName = file.split('/').pop();
    const testName = fileName ? fileName.replace('.json', '') : undefined;

    if (dry) {
      console.log(stringifiedFile);
    } else if (!testName) {
      chalk.red('Please try again. Now file or folder found');
    } else {
      exportFileToFolder({
        stringifiedFile,
        testName,
        outputPath,
        outputFolder,
      });
    }
  });
}

function exportFileToFolder({
  stringifiedFile,
  testName,
  outputPath,
  outputFolder,
}: ExportToFile): void {
  const folderPath = path.join('.', outputPath);
  if (!existsSync(folderPath)) {
    mkdir(
      path.join('.', outputPath),
      {
        recursive: true,
      },
      (err: NodeJS.ErrnoException | null) => {
        if (!err) {
          exportFileToFolder({
            stringifiedFile,
            testName,
            outputFolder,
            outputPath,
          });
        } else {
          console.error(
            `😭 Something went wrong while creating ${outputPath}\n Stacktrace: ${err?.stack}`,
          );
        }
      },
    );
  } else {
    writeFile(
      path.join(outputFolder, `/${testName}.js`),
      stringifiedFile,
      (err: NodeJS.ErrnoException | null) => {
        if (!err) {
          console.log(
            chalk.green(
              `\n ✅ ${testName}.json exported to ${outputPath}/${testName}.js\n `,
            ),
          );
        } else {
          console.log(
            chalk.red(
              `\n 😭 Something went wrong exporting ${outputPath}/${testName}.js \n`,
            ),
          );
        }
      },
    );
  }
}
