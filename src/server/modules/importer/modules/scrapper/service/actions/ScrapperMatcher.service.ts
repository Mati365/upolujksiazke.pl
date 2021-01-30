import {Injectable} from '@nestjs/common';
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
   * @todo
   *   Use Promise.all and pool!
   *
   * @template R
   * @param {MatchRecordAttrs} attrs
   * @returns {Promise<ScrapperMatcherResult<R>[]>}
   * @memberof ScrapperMatcherService
   */
  async searchRemoteRecord<R>(attrs: MatchRecordAttrs): Promise<ScrapperMatcherResult<R>[]> {
    const {scrappersGroups} = this.scrapperService;
    const results = [];

    for await (const scrapper of scrappersGroups) {
      try {
        const result = await scrapper.searchRemoteRecord(attrs);
        if (result)
          results.push(result);
      } catch (e) {
        console.error(e);
      }
    }

    return results;
  }
}
