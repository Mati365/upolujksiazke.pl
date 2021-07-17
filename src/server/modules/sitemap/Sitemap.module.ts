import {DynamicModule, Module} from '@nestjs/common';
import {SitemapService, SitemapServiceOptions, SITEMAP_OPTIONS} from './services/Sitemap.service';
import {SitemapRefreshCron} from './cron/SitemapRefresh.cron';
import {BookModule} from '../book/Book.module';
import {
  BookAuthorSitemapGenerator,
  BookCategorySitemapGenerator,
  BookSitemapGenerator,
  BookTagSitemapGenerator,
} from './services/generators';

@Module({})
export class SitemapModule {
  static register(options: SitemapServiceOptions): DynamicModule {
    return {
      module: SitemapModule,
      imports: [
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
        BookTagSitemapGenerator,
      ],
      exports: [
        SitemapService,
      ],
    };
  }
}
