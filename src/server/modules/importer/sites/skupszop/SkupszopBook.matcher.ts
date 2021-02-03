import {fuzzyFindBookAnchor} from '@scrapper/helpers';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class SkupszopBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    return {
      result: await this.parsers[ScrapperMetadataKind.BOOK].parse(
        await this.searchByPhrase(data),
      ),
    };
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof SkupszopBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        word: title, // it works a bit better without author
      },
    ))?.$;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.product-content-list > .product-content-list-ul > li.product-grid-item'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $anchor = $(anchor);

          return {
            title: $anchor.find('.product-variant-link').text(),
            author: $anchor.find('.product-list-author-box > a:first-child').text(),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('.product-variant-link').attr('href'),
    );
  }
}
