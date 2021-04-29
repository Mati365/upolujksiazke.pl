import {Injectable, Logger} from '@nestjs/common';
import pMap from 'p-map';
import chalk from 'chalk';
import * as R from 'ramda';

import {SentryService} from '@server/modules/sentry/Sentry.service';
import {ScrapperService} from '../Scrapper.service';
import {ScrapperMatcherResult} from '../shared/ScrapperMatcher';
import {MatchRecordAttrs, WebsiteScrappersGroup} from '../shared';

type ServiceMatcherResult<R> = {
  matchedItems: ScrapperMatcherResult<R>[],
  notMatchedInScrappers: WebsiteScrappersGroup[],
};

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
   * @param {MatcherSearchAttrs} attrs
   * @returns {Promise<ServiceMatcherResult<R>>}
   * @memberof ScrapperMatcherService
   */
  async searchRemoteRecord<R>(attrs: MatchRecordAttrs): Promise<ServiceMatcherResult<R>> {
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
          const result = await group.searchRemoteRecord(attrs);

          return {
            ...result,
            scrappersGroup: group,
          };
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

    const {matched, notMatched} = R.groupBy(
      (item) => (
        item?.result
          ? 'matched'
          : 'notMatched'
      ),
      items,
    );

    return {
      matchedItems: matched,
      notMatchedInScrappers: R.map(
        ({scrappersGroup}) => scrappersGroup,
        (notMatched || []).filter(Boolean),
      ),
    };
  }
}
