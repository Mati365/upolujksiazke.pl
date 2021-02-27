import {escapeIso88592} from '@server/common/helpers/encoding/escapeIso88592';
import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class GraniceBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
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
   * @memberof GraniceBookMatcher
   */
  private async searchByPhrase({authors, title}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      `?search=${escapeIso88592(`${title} ${authors[0].name || ''}`.trim())}`,
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('[book-id]'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('.cont > .title').text(),
          author: $(anchor).find('.cont > .details > .author').text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor)
        .find('a.title[href^="/ksiazka/"]')
        .attr('href'),
    );
  }
}
