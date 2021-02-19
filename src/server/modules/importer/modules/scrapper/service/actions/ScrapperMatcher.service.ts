import {Injectable} from '@nestjs/common';
import pMap from 'p-map';

import {ScrapperService} from '../Scrapper.service';
import {ScrapperMatcherResult} from '../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../shared';

@Injectable()
export class ScrapperMatcherService {
  constructor(
    private readonly scrapperService: ScrapperService,
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
    const {scrappersGroups} = this.scrapperService;
    const items = await pMap(
      scrappersGroups,
      (scrapper) => scrapper.searchRemoteRecord(attrs),
      {
        concurrency: 5,
      },
    );

    return items.filter((item) => !!item?.result);
  }
}
