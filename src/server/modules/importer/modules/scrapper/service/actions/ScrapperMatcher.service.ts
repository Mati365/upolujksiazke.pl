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
   *Iterate sequentially over scrappers and tries
   *
   * @template R Result type
   * @param {MatchRecordAttrs} attrs
   * @returns {Promise<R>}
   * @memberof ScrapperMatcherService
   */
  async matchSingle<R>(attrs: MatchRecordAttrs): Promise<ScrapperMatcherResult<R>> {
    const {scrappersGroups} = this.scrapperService;

    for await (const scrapper of scrappersGroups) {
      try {
        const result = await scrapper.matchRecord(attrs);
        if (result)
          return result;
      } catch (e) {
        console.error(e);
      }
    }

    return null;
  }
}
