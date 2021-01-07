import cheerio from 'cheerio';
import {HTTPCode} from '@shared/constants';

// eslint-disable-next-line max-len
export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';

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
 * @returns
 */
export async function parseAsyncURL(url: string) {
  const request = new Request(url);
  const {result, response} = await fetchAsyncHTML(request);

  return {
    $: cheerio.load(result, {decodeEntities: false}),
    result,
    request,
    response,
  };
}

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
