import {DynamicModule, Module} from '@nestjs/common';
import {SitemapService, SitemapServiceOptions, SITEMAP_OPTIONS} from './services/Sitemap.service';
import {SitemapRefreshCron} from './cron/SitemapRefresh.cron';
import {BookModule} from '../book/Book.module';
import {TagModule} from '../tag/Tag.module';
import {
  BookAuthorSitemapGenerator,
  BookCategorySitemapGenerator,
  BookSitemapGenerator,
  TagSitemapGenerator,
} from './services/generators';

@Module({})
export class SitemapModule {
  static register(options: SitemapServiceOptions): DynamicModule {
    return {
      module: SitemapModule,
      imports: [
        TagModule,
        BookModule,
      ],
      providers: [
        {
          provide: SITEMAP_OPTIONS,
          useValue: options,
        },
        SitemapService,
        SitemapRefreshCron,
        BookSitemapGenerator,
        BookAuthorSitemapGenerator,
        BookCategorySitemapGenerator,
        TagSitemapGenerator,
      ],
      exports: [
        SitemapService,
      ],
    };
  }
}
