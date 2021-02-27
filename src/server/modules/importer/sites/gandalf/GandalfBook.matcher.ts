import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

/**
 * @export
 * @class GandalfBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class GandalfBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
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

  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      encodeURIComponent(title).toLowerCase(),
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('#list-of-filter-products > ul.internal-list > .product-box .info-box .content-left'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('> .title').text(),
          author: $(anchor).find('.author').toArray().map((el: cheerio.Element) => $(el).attr('title')) || [],
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('a.title').attr('href'),
    );
  }
}
