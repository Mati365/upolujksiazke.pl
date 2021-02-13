import * as fs from 'fs';
import * as util from 'util';
import chalk from 'chalk';
import {pipeline} from 'stream';
import {Logger} from '@nestjs/common';

import {convertBytesToKilobytes} from '@shared/helpers/convert';

const streamPipeline = util.promisify(pipeline);

export type RemoteFileStats = {
  type: string,
  size: {
    bytes: number,
    kilobytes: number,
  },
};

export type FileDownloaderAttrs = {
  timeout?: number,
  url: string,
  outputFile: string,
  headerValidatorFn?(stats: RemoteFileStats): boolean,
};

/**
 * Performs HEAD to remote server and fetches size and type
 *
 * @export
 * @param {string} url
 * @returns {Promise<RemoteFileStats>}
 */
export async function fetchRemoteFileStats(url: string): Promise<RemoteFileStats> {
  const {headers} = await fetch(
    url,
    {
      method: 'HEAD',
    },
  );

  const contentLength = +headers.get('content-length');

  return {
    type: headers.get('content-type'),
    size: {
      bytes: contentLength,
      kilobytes: convertBytesToKilobytes(contentLength),
    },
  };
}

/**
 * Saves remote file to disk
 *
 * @export
 * @param {FileDownloaderAttrs} attrs
 * @returns
 */
export async function downloadFile(
  {
    timeout = 4000,
    url,
    outputFile,
    headerValidatorFn,
  }: FileDownloaderAttrs,
) {
  if (headerValidatorFn) {
    if (!headerValidatorFn(await fetchRemoteFileStats(url)))
      return undefined;
  }

  const logger = new Logger('downloadFile');
  const controller = new AbortController;
  const timeoutTimer = setTimeout(
    () => controller.abort(),
    timeout,
  );

  logger.warn(`Fetching file from ${chalk.bold(url)} to ${chalk.bold(outputFile)}!`);

  const startDate = Date.now();
  const res = await fetch(
    url,
    {
      signal: controller.signal,
    },
  );

  if (!res.ok) {
    clearTimeout(timeoutTimer);
    throw new Error(`unexpected response ${res.statusText}`);
  }

  await streamPipeline(
    res.body as any,
    fs.createWriteStream(outputFile),
  );

  logger.log(`File from ${chalk.bold(url)} fetched in ${((Date.now() - startDate) / 1000).toFixed(2)}s!`);
  clearTimeout(timeoutTimer);

  return {
    outputFile,
  };
}
