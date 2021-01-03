import cheerio from 'cheerio';
import {HTTPCode} from '@shared/constants';

/**
 * Fetches html and fixes encoding
 *
 * @export
 * @param {Request} request
 * @returns
 */
export async function fetchAsyncHTML(request: Request) {
  const response = await fetch(request);

  return {
    response,
    result: (response as any).textConverted(),
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
    $: cheerio.load(result),
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
