import {escapeIso88592} from '@server/common/helpers/encoding/escapeIso88592';
import {fuzzyFindBookAnchor} from '@scrapper/helpers';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

/**
 * @todo
 *  Add book reviews to content discovery
 *
 * @export
 * @class BonitoBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class BonitoBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
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
   * @memberof BonitoBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageByPath(`szukaj/${escapeIso88592(title)}/0,0,1/0`))?.$;
    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('table[style="background-color: #FFFFFF; border-width: 0px; width: 100%; height: 50px;"]'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $anchor = $(anchor);

          return {
            title: $anchor.find('a[href^="/k-"]').text(),
            author: $anchor.find('a[href^="/autor/"]').text(),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('a[href^="/k-"]').attr('href'),
    );
  }
}
