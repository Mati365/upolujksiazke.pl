import cheerio from 'cheerio';

/**
 * Fetches html and fixes encoding
 *
 * @export
 * @param {string} url
 * @returns
 */
export async function fetchAsyncHTML(url: string) {
  const result = await fetch(url);

  return (result as any).textConverted();
}

/**
 * Fetches website and try to parse it
 *
 * @export
 * @param {string} url
 * @returns
 */
export async function parseAsyncURL(url: string) {
  return cheerio.load(
    await fetchAsyncHTML(url),
  );
}
