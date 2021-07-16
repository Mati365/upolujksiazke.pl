import {Module} from '@nestjs/common';
import {SitemapService} from './services/Sitemap.service';
import {SitemapRefreshCron} from './cron/SitemapRefresh.cron';

@Module(
  {
    providers: [
      SitemapService,
      SitemapRefreshCron,
    ],
  },
)
export class SitemapModule {}
