import {SitemapAndIndexStream, SitemapStream, streamToPromise} from 'sitemap';
import {createGzip} from 'zlib';
import {createWriteStream} from 'fs';
import * as path from 'path';

import {concatUrlParts} from '@shared/helpers/concatUrls';
import {CanBePromise} from '@shared/types';

export type SitemapGeneratorResult = {
  filePath: string,
};

export type SitemapGeneratorConfig = {
  outputPath: string,
  hostname: string,
  urlNestedPath?: string,
};

export type ChunkSitemapStreamAttrs = SitemapGeneratorConfig & {
  indexFileName: string,
  streamWriterFn(stream: SitemapAndIndexStream): CanBePromise<void>,
};

export abstract class SitemapGenerator {
  abstract generate(config: SitemapGeneratorConfig): Promise<SitemapGeneratorResult>;

  /**
   * Create chunked sitemap stream
   *
   * @static
   * @async
   * @param {ChunkSitemapStreamAttrs} attrs
   * @return {SitemapGeneratorResult}
   * @memberof SitemapGenerator
   */
  static async createChunkedSitemapStream(
    {
      streamWriterFn,
      indexFileName,
      hostname,
      outputPath,
      urlNestedPath = '',
    }: ChunkSitemapStreamAttrs,
  ): Promise<SitemapGeneratorResult> {
    const stream = new SitemapAndIndexStream(
      {
        limit: 2500,
        getSitemapStream: (i) => {
          const file = `./${indexFileName}-${i}.xml.gz`;
          const sitemapStream = new SitemapStream(
            {
              hostname,
            },
          );

          sitemapStream
            .pipe(createGzip())
            .pipe(createWriteStream(path.resolve(outputPath, file)));

          return <any> [
            concatUrlParts([
              hostname,
              urlNestedPath,
              file,
            ]),
            sitemapStream,
          ];
        },
      },
    );

    const rootFile = path.resolve(outputPath, `${indexFileName}.gz`);
    stream
      .pipe(createGzip())
      .pipe(createWriteStream(rootFile));

    // wait until end
    await streamWriterFn(stream);
    const promise = streamToPromise(stream);
    stream.end();
    await promise;

    return {
      filePath: rootFile,
    };
  }
}
