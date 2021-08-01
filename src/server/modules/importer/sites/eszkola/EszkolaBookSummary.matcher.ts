import * as R from 'ramda';

import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class EszkolaBookSummaryMatcher
  extends WebsiteScrapperMatcher<CreateBookSummaryDto, DefaultUrlsConfig> {
  static BOOK_SUMMARY_LISTING_SUFFIX = '- streszczenie';

  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookSummaryDto>)
    : Promise<ScrapperMatcherResult<CreateBookSummaryDto>> {
    return {
      result: await this.parsers[ScrapperMetadataKind.BOOK_SUMMARY].parse(
        await this.searchByPhrase(data),
      ),
    };
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookSummaryDto} bookSummary
   * @memberof BrykBookSummaryMatcher
   */
  private async searchByPhrase({book}: CreateBookSummaryDto) {
    const {BOOK_SUMMARY_LISTING_SUFFIX} = EszkolaBookSummaryMatcher;
    const {title} = book;

    const $ = (await this.fetchPageBySearch(
      {
        ie: 'UTF-8',
        q: title,
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('#search_results > strong > ul > li > a'),
        book: {
          title,
        },
        anchorSelector: (anchor) => {
          const anchorTitle = $(anchor).find('> span').text();
          if (!R.endsWith(BOOK_SUMMARY_LISTING_SUFFIX, anchorTitle))
            return null;

          return {
            title: anchorTitle.substring(0, anchorTitle.length - BOOK_SUMMARY_LISTING_SUFFIX.length),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).attr('href'),
    );
  }
}
