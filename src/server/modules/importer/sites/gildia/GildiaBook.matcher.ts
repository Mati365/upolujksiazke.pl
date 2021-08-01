import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

export class GildiaBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, DefaultUrlsConfig> {
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
   * @memberof GildiaBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        q: title, // it works a bit better without author
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.products-row > .product-row'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $title = $(anchor).find('> .author-and-title');

          return {
            title: $title.find('.title .pjax').text(),
            author: $title.find('.author .pjax').text().split(','),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('.title .pjax').attr('href'),
    );
  }
}
