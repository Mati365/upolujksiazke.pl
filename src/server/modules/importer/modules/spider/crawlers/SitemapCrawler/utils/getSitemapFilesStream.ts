import * as path from 'path';
import * as fs from 'fs/promises';
import parser from 'fast-xml-parser';

import {downloadFile} from '@server/common/helpers/downloadFile';
import {fetchSitemaps, SitemapLink} from './fetchSitemaps';

export type SitemapFilesStreamAttrs = {
  url: string,
  outputPath: string,
  concurrency?: number,
};

/**
 * Fetches sitemap, extract all packages and
 * creates observable that returns files paths
 *
 * @export
 * @param {SitemapExtractorAttrs} attrs
 */
export async function getSitemapFilesStream(
  {
    url,
    outputPath,
    concurrency = 5,
  }: SitemapFilesStreamAttrs,
) {
  const {outputFile: sitemapIndexFile} = await downloadFile(
    {
      url,
      outputFile: path.resolve(outputPath, 'sitemap.xml'),
    },
  );

  const {sitemap: sitemaps}: {sitemap: SitemapLink[]} = (
    parser
      .parse((await fs.readFile(sitemapIndexFile)).toString())
      .sitemapindex
  );

  return fetchSitemaps(
    {
      tmpDir: path.resolve(outputPath, 'parts'),
      sitemaps,
      concurrency,
    },
  );
}
