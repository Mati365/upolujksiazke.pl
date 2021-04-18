import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class EszkolaBookSummaryMatcher
  extends WebsiteScrapperMatcher<CreateBookSummaryDto, BookShopScrappersGroupConfig> {
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
          title: `${title.trim()} - streszczenie`,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('> span').text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).attr('href'),
    );
  }
}
