import {Injectable, Logger} from '@nestjs/common';
import pMap from 'p-map';
import chalk from 'chalk';
import * as R from 'ramda';

import {ScrapperService} from '../Scrapper.service';
import {ScrapperMatcherResult} from '../shared/ScrapperMatcher';
import {MatchRecordAttrs, WebsiteScrappersGroup} from '../shared';

type ServiceMatcherResult<R> = {
  matchedItems: ScrapperMatcherResult<R>[],
  notMatchedInScrappers: WebsiteScrappersGroup[],
};

type SearchRemoteRecordMatchAttrs = MatchRecordAttrs & {
  scrapperGroupsIds?: number[],
};

@Injectable()
export class ScrapperMatcherService {
  private readonly logger = new Logger(ScrapperMatcherService.name);

  constructor(
    private readonly scrapperService: ScrapperService,
  ) {}

  /**
   * Iterate sequentially over scrappers and tries
   *
   * @template R
   * @param {SearchRemoteRecordMatchAttrs} attrs
   * @returns {Promise<ServiceMatcherResult<R>>}
   * @memberof ScrapperMatcherService
   */
  async searchRemoteRecord<R>(
    {
      scrapperGroupsIds,
      ...attrs
    }: SearchRemoteRecordMatchAttrs,
  ): Promise<ServiceMatcherResult<R>> {
    const {
      logger,
      scrapperService,
    } = this;

    const {scrappersGroups} = scrapperService;
    const items = await pMap(
      scrappersGroups,
      async (group) => {
        if (scrapperGroupsIds && !R.includes(group.id, scrapperGroupsIds))
          return null;

        try {
          const result = await group.searchRemoteRecord(attrs);

          return {
            ...result,
            scrappersGroup: group,
          };
        } catch (e) {
          logger.error(`Scrapper ${chalk.bold(group.websiteURL)}:`, e);
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
      items.filter(Boolean),
    );

    return {
      matchedItems: matched || [],
      notMatchedInScrappers: R.map(
        ({scrappersGroup}) => scrappersGroup,
        (notMatched || []).filter(Boolean),
      ),
    };
  }
}
