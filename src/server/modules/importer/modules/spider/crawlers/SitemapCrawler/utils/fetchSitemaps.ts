import {from, of, defer} from 'rxjs';
import {filter, mergeAll, concatMap} from 'rxjs/operators';
import * as path from 'path';
import * as R from 'ramda';
import {mkdirp} from 'fs-extra';

import {downloadFile} from '@server/common/helpers/downloadFile';
import {ungzipFile} from '@server/common/helpers/extractor/gzip';

export type SitemapLink = {
  loc: string,
};

export type SitemapsFetcherAttrs = {
  sitemaps: SitemapLink[],
  tmpDir: string,
  timeout?: number,
  concurrency?: number,
};

export const isGzipFilepath = R.endsWith('.gz');
export const dropGzipFilepath = R.dropLast(3);

/**
 * Download parallel sitemaps and parse them
 *
 * @export
 * @param {SitemapsFetcherAttrs} attrs
 * @returns
 */
export async function fetchSitemaps(
  {
    sitemaps,
    tmpDir,
    timeout = 60_000,
    concurrency = 5,
  }: SitemapsFetcherAttrs,
) {
  await mkdirp(tmpDir);

  const createDownloadSitemapLinkDefer = ({loc}: SitemapLink) => defer(
    () => downloadFile(
      {
        timeout,
        url: loc,
        outputFile: path.resolve(tmpDir, path.basename(loc)),
      },
    )
      .then(({outputFile}) => outputFile),
  );

  const observables = sitemaps.map(
    (link) => createDownloadSitemapLinkDefer(link).pipe(
      concatMap(
        (filepath) => {
          if (!filepath || !isGzipFilepath(filepath))
            return of(filepath);

          return from(ungzipFile(
            {
              src: filepath,
              dest: dropGzipFilepath(filepath),
              deleteSrc: true,
            },
          ));
        },
      ),
      filter((filepath) => !R.isNil(filepath)),
    ),
  );

  return from(observables).pipe(
    mergeAll(concurrency),
  );
}
