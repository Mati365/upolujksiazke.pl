import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class BrykBookSummaryMatcher extends WebsiteScrapperMatcher<CreateBookSummaryDto, BookShopScrappersGroupConfig> {
  // eslint-disable-next-line max-len
  static BOOK_SEARCH_LISTING_SELECTOR = '.search-finding .results-block.lectures .lectures-main-content-wrapper .lectures-main-content .list-item .lecture-wrapper';

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
    const {title, authors} = book;
    const $ = (await this.fetchPageBySearch(
      {
        q: title,
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $(BrykBookSummaryMatcher.BOOK_SEARCH_LISTING_SELECTOR),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $anchor = $(anchor);

          return {
            title: $anchor.find('.lecture-title strong').text(),
            author: $anchor.find('.lecture-autor').text(),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).attr('href'),
    );
  }
}
