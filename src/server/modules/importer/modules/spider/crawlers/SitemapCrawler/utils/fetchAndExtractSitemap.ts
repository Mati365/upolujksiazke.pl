import * as fs from 'fs';
import {concatMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import XmlStream from 'xml-stream';

import {getSitemapFilesStream, SitemapFilesStreamAttrs} from './getSitemapFilesStream';

/**
 * Fetches sitemap, extract all packages and creates obserable
 *
 * @export
 * @param {SitemapFilesStreamAttrs} attrs
 */
export async function fetchAndExtractSitemap(attrs: SitemapFilesStreamAttrs) {
  const stream$ = await getSitemapFilesStream(attrs);

  return stream$.pipe(
    // do not use mergeMap here
    concatMap((filepath) => new Observable<string>((subscriber) => {
      const stream = fs.createReadStream(filepath);
      const xml = new XmlStream(stream);

      xml.preserve('item', true);
      xml.collect('subitem');

      xml.on('endElement: loc', (item: any) => {
        subscriber.next(item.$text);
      });

      xml.on('end', () => {
        subscriber.complete();
      });

      xml.on('error', (err: any) => {
        subscriber.error(err);
      });
    })),
  );
}
