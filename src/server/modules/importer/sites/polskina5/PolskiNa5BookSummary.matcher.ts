import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class PolskiNa5BookSummaryMatcher
  extends WebsiteScrapperMatcher<CreateBookSummaryDto, DefaultUrlsConfig> {
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
   * @memberof PolskiNa5BookSummaryMatcher
   */
  private async searchByPhrase({book}: CreateBookSummaryDto) {
    const {title} = book;
    const $ = (await parseAsyncURLIfOK(this.homepageURL))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.wrapper > .content > .main > .main_autor > .polski_content a'),
        book: {
          title,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).attr('href'),
    );
  }
}
