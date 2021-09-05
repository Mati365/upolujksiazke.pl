import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';

import {isCmdAppInstance} from '@server/common/helpers';
import {SitemapService} from '../services/Sitemap.service';

@Injectable()
export class SitemapRefreshCron {
  constructor(
    private readonly sitemapService: SitemapService,
  ) {}

  /**
   * Regenerate sitemap files
   *
   * @memberof SitemapRefreshCron
   */
  @Cron(CronExpression.EVERY_DAY_AT_5PM)
  async refreshSitemap() {
    if (!isCmdAppInstance())
      await this.sitemapService.refresh();
  }
}
