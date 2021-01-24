import cheerio from 'cheerio';
import chalk from 'chalk';
import {Logger} from '@nestjs/common';

import {HTTPCode} from '@shared/constants';
import {isDevMode} from '@shared/helpers/isDevMode';

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

  return {
    response,
    result: await (response as any).textConverted(),
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
 * @returns
 */
export async function parseAsyncURLIfOK(url: string) {
  try {
    const result = await parseAsyncURL(url);
    return (
      result.response.status !== HTTPCode.OK
        ? null
        : result
    );
  } catch (e) {
    return null;
  }
}
