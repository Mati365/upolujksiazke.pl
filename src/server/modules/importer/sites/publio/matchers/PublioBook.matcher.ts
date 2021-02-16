import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';

export class PublioBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    return {
      result: await this.parsers[ScrapperMetadataKind.BOOK].parse(
        await this.searchByPhrase(data),
        {
          shallowParse: true,
        },
      ),
    };
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof PublioBookMatcher
   */
  private async searchByPhrase({authors, title}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        q: title,
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.product-tail .product-description'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('.title').eq(0).text(),
          author: $(anchor).find('.authors > a:first-child').eq(0).text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor)
        .find('.product-description > a')
        .attr('href'),
    );
  }
}
