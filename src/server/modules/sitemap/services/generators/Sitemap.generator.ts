import {SitemapAndIndexStream, SitemapIndexStream} from 'sitemap';
import {CanBePromise} from '@shared/types';

export type SitemapGeneratorResult = {
  filePath: string,
};

export type SitemapGeneratorConfig = {
  stream: SitemapIndexStream,
};

export type ChunkSitemapStreamAttrs = SitemapGeneratorConfig & {
  indexFileName: string,
  streamWriterFn(stream: SitemapAndIndexStream): CanBePromise<void>,
};

export interface SitemapGenerator {
  generate(config: SitemapGeneratorConfig): Promise<void>;
}
