import {Inject, Injectable} from '@nestjs/common';
import {SitemapIndexStream} from 'sitemap';
import {createGzip} from 'zlib';
import {createWriteStream} from 'fs';
import * as path from 'path';
import {move} from 'fs-extra';

import {removeDirIfExistsAsync} from '@server/common/helpers';

import {CanBePromise} from '@shared/types';
import {MeasureCallDuration} from '@server/common/helpers/decorators';
import {
  EnterTmpFolderScope,
  TmpDirService,
  TmpFolderScopeAttrs,
} from '@server/modules/tmp-dir';

import {
  SitemapGenerator,
  SitemapGeneratorConfig,
  BookSitemapGenerator,
  BookAuthorSitemapGenerator,
  BookCategorySitemapGenerator,
  BookTagSitemapGenerator,
} from './generators';

export const SITEMAP_OPTIONS = 'SITEMAP_OPTIONS';

export type SitemapServiceOptions = SitemapGeneratorConfig & {};

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
    readonly bookTagGenerator: BookTagSitemapGenerator,
  ) {
    this.generators = [
      bookGenerator,
      bookAuthorGenerator,
      bookCategoryGenerator,
      bookTagGenerator,
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
    const streamWriterFn: SitemapStreamWriterFn = async ({stream, outputWriterPath}) => {
      for await (const generator of generators) {
        const {filePath} = await generator.generate(
          {
            urlNestedPath,
            hostname,
            outputPath: outputWriterPath,
          },
        );

        stream.write(
          path.join(
            `https://${hostname}`,
            urlNestedPath,
            path.basename(filePath),
          ),
        );
      }
    };

    await SitemapService.createIndexSitemapStream(
      {
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
      tmpFolderPath,
      outputPath,
      streamWriterFn,
    }: {
      tmpFolderPath: string,
      outputPath: string,
      streamWriterFn: SitemapStreamWriterFn,
    },
  ): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      try {
        const stream = new SitemapIndexStream;
        stream
          .pipe(createGzip())
          .pipe(createWriteStream(path.resolve(tmpFolderPath, 'sitemap.xml.gz')));

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
