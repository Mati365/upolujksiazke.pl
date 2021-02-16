import {escapeIso88592} from '@server/common/helpers/encoding/escapeIso88592';
import {fuzzyFindBookAnchor} from '@scrapper/helpers';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class ArosBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
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
   * @param {CreateBookDto} scrapperInfo
   * @memberof ArosBookMatcher
   */
  async searchByPhrase({authors, title}: CreateBookDto) {
    const $ = (await this.fetchPageByPath(
      `szukaj/${escapeIso88592(title)}/0?sortuj_wedlug=0&wyczysc_filtry=1`,
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('body > div > div.grid_right > table table[bgcolor="white"] td[width="100%"]'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('a[href*="/ksiazka/"]').text(),
          author: $(anchor).find('a[href*="/autor/"]').text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor)
        .find('a[href*="/ksiazka/"]')
        .attr('href'),
    );
  }
}
