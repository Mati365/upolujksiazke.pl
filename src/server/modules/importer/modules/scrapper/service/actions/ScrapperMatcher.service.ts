import {Injectable} from '@nestjs/common';
import pLimit from 'p-limit';

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
    const limit = pLimit(4);
    const result = await Promise.all(
      scrappersGroups.map(
        (scrapper) => limit(() => scrapper.searchRemoteRecord(attrs)),
      ),
    );

    return result.filter(Boolean);
  }
}
