import {Inject, Injectable} from '@nestjs/common';
import {SitemapIndexStream, SitemapAndIndexStream, SitemapStream} from 'sitemap';
import {createGzip} from 'zlib';
import {createWriteStream} from 'fs';
import * as path from 'path';
import {move} from 'fs-extra';

import {removeDirIfExistsAsync} from '@server/common/helpers';
import {concatUrlParts} from '@shared/helpers/concatUrls';

import {CanBePromise} from '@shared/types';
import {MeasureCallDuration} from '@server/common/helpers/decorators';
import {
  EnterTmpFolderScope,
  TmpDirService,
  TmpFolderScopeAttrs,
} from '@server/modules/tmp-dir';

import {
  SitemapGenerator,
  BookSitemapGenerator,
  BookAuthorSitemapGenerator,
  BookCategorySitemapGenerator,
  TagSitemapGenerator,
} from './generators';

export const SITEMAP_OPTIONS = 'SITEMAP_OPTIONS';

export type SitemapServiceOptions = {
  outputPath: string,
  hostname: string,
  urlNestedPath?: string,
};

type SitemapStreamWriterFn = (
  attrs: {
    stream: SitemapIndexStream,
    outputWriterPath: string,
  },
) => CanBePromise<void>;

@Injectable()
export class SitemapService {
  private readonly generators: SitemapGenerator[];

  constructor(
    @Inject(SITEMAP_OPTIONS) readonly options: SitemapServiceOptions,
    private readonly tmpDirService: TmpDirService,
    readonly bookGenerator: BookSitemapGenerator,
    readonly bookAuthorGenerator: BookAuthorSitemapGenerator,
    readonly bookCategoryGenerator: BookCategorySitemapGenerator,
    readonly tagGenerator: TagSitemapGenerator,
  ) {
    this.generators = [
      bookGenerator,
      bookAuthorGenerator,
      bookCategoryGenerator,
      tagGenerator,
    ];
  }

  async refresh(): Promise<void> {
    return this.generateSitemaps(this.options);
  }

  /**
   * Create temp directory and reindex
   *
   * @param {SitemapServiceOptions} attrs
   * @param {TmpFolderScopeAttrs} tmpDirAttrs
   * @return {Promise<void>}
   * @memberof SitemapService
   */
  @EnterTmpFolderScope()
  @MeasureCallDuration('generateSitemap')
  async generateSitemaps(
    {
      urlNestedPath,
      hostname,
      outputPath,
    }: SitemapServiceOptions,
    {
      tmpFolderPath,
    }: TmpFolderScopeAttrs = null,
  ): Promise<void> {
    const {generators} = this;
    const streamWriterFn: SitemapStreamWriterFn = async ({stream}) => {
      for await (const generator of generators) {
        await generator.generate(
          {
            stream,
          },
        );
      }
    };

    await SitemapService.createIndexSitemapStream(
      {
        hostname,
        urlNestedPath,
        outputPath,
        tmpFolderPath,
        streamWriterFn,
      },
    );
  }

  /**
   * Generate root website sitemap
   *
   * @static
   * @param {Object} attrs
   * @return {Promise<void>}
   * @memberof SitemapService
   */
  static async createIndexSitemapStream(
    {
      hostname,
      urlNestedPath,
      tmpFolderPath,
      outputPath,
      streamWriterFn,
      filename = 'sitemap',
    }: SitemapServiceOptions & {
      filename?: string,
      tmpFolderPath: string,
      streamWriterFn: SitemapStreamWriterFn,
    },
  ): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      try {
        const stream = new SitemapAndIndexStream(
          {
            limit: 2500,
            getSitemapStream: (i) => {
              const file = `${filename}-${i + 1}.xml.gz`;
              const sitemapStream = new SitemapStream(
                {
                  hostname,
                },
              );

              sitemapStream
                .pipe(createGzip())
                .pipe(createWriteStream(path.resolve(tmpFolderPath, file)));

              return <any> [
                concatUrlParts(
                  [
                    hostname,
                    urlNestedPath,
                    file,
                  ],
                ),
                sitemapStream,
              ];
            },
          },
        );

        stream
          .pipe(createGzip())
          .pipe(
            createWriteStream(
              path.resolve(tmpFolderPath, `${filename}.xml.gz`),
            ),
          );

        await streamWriterFn(
          {
            outputWriterPath: tmpFolderPath,
            stream,
          },
        );

        stream.end(async () => {
          await removeDirIfExistsAsync(outputPath);
          await move(
            path.resolve(tmpFolderPath),
            path.resolve(outputPath),
          );

          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
