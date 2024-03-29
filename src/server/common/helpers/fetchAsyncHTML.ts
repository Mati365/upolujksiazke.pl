import cheerio from 'cheerio';
import chalk from 'chalk';
import {Logger} from '@nestjs/common';
import * as R from 'ramda';

import {HTTPCode} from '@shared/constants';
import {
  concatUrls,
  isDevMode,
  timeout,
} from '@shared/helpers';

import {convertBody} from './detect-encoding';

// eslint-disable-next-line max-len
export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36';

/**
 * Fetches html and fixes encoding
 *
 * @export
 * @param {Request} request
 * @returns
 */
export async function fetchAsyncHTML(request: Request) {
  const response = await fetch(request, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
    },
  });

  const buf = await response.arrayBuffer();
  const text = convertBody(buf, response.headers);

  return {
    result: text,
    response,
  };
}

/**
 * Fetches website and try to parse it
 *
 * @export
 * @param {string} url
 * @returns {AsyncURLParseResult}
 */
export async function parseAsyncURL(url: string): Promise<AsyncURLParseResult> {
  const request = new Request(url);
  const {result, response} = await fetchAsyncHTML(request);

  if (isDevMode()) {
    new Logger('parseAsyncURL').warn(
      `Fetching ${chalk.bold(url)}!`,
    );
  }

  return {
    $: cheerio.load(result, {decodeEntities: false}),
    url,
    result,
    request,
    response,
  };
}

export type AsyncURLParseResult = {
  $: cheerio.Root,
  url: string,
  result: any,
  request: Request,
  response: Response,
};

/**
 * Returns async html if found (only when 200 status code is present)
 *
 * @export
 * @param {string} url
 * @param {boolean} [noRetry]
 * @returns {Promise<AsyncURLParseResult>}
 */
export async function parseAsyncURLIfOK(url: string, noRetry?: boolean): Promise<AsyncURLParseResult> {
  try {
    const result = await parseAsyncURL(url);
    const {status} = result.response;

    if (status === HTTPCode.OK)
      return result;

    if (!noRetry && status === HTTPCode.BAD_GATEWAY) {
      await timeout(500);
      return await parseAsyncURLIfOK(url, true);
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Fetches website by its path
 *
 * @export
 * @param {string} homepageURL
 * @param {string} path
 * @return {string}
 */
export async function parseAsyncURLPathIfOK(homepageURL: string, path: string): Promise<AsyncURLParseResult> {
  if (!path)
    return null;

  return parseAsyncURLIfOK(
    R.unless(
      R.startsWith(homepageURL),
      R.partial(concatUrls, [homepageURL]),
    )(path),
  );
}
