import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@importer/kinds/scrappers/BookShop.scrapper';

export class MatrasBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
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
   * @memberof MatrasBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        szukaj: `${title} ${authors[0].name || ''}`.trim(),
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.mainContainer .booksBox .booksContainer .book'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $title = $(anchor).find('> .title');

          return {
            title: $title.find('.title h2').text(),
            author: $title.find('.title h3').text(),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('a.show').attr('href'),
    );
  }
}
