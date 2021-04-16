import {Injectable, Logger} from '@nestjs/common';
import pMap from 'p-map';
import chalk from 'chalk';

import {SentryService} from '@server/modules/sentry/Sentry.service';
import {ScrapperService} from '../Scrapper.service';
import {ScrapperMatcherResult} from '../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../shared';

@Injectable()
export class ScrapperMatcherService {
  private readonly logger = new Logger(ScrapperMatcherService.name);

  constructor(
    private readonly scrapperService: ScrapperService,
    private readonly sentryService: SentryService,
  ) {}

  /**
   * Iterate sequentially over scrappers and tries
   *
   * @template R
   * @param {MatchRecordAttrs} attrs
   * @returns {Promise<ScrapperMatcherResult<R>[]>}
   * @memberof ScrapperMatcherService
   */
  async searchRemoteRecord<R>(attrs: MatchRecordAttrs): Promise<ScrapperMatcherResult<R>[]> {
    const {
      logger,
      sentryService,
      scrapperService,
    } = this;

    const {scrappersGroups} = scrapperService;
    const items = await pMap(
      scrappersGroups,
      async (group) => {
        try {
          return await group.searchRemoteRecord(attrs);
        } catch (e) {
          logger.error(`Scrapper ${chalk.bold(group.websiteURL)}:`, e);
          sentryService.instance.captureException(e);
          return null;
        }
      },
      {
        concurrency: 5,
      },
    );

    return items.filter((item) => !!item?.result);
  }
}
