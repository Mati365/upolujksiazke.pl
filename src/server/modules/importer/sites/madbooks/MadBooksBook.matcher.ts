import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

/**
 * @export
 * @class MadBooksBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, DefaultUrlsConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class MadBooksBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, DefaultUrlsConfig> {
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
   * @memberof MadBooksBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        q: title,
        red: 0,
        ias: '1,9,8,7',
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('ul.product-list.gallery > li > .product-box'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('.product-name > h2').text(),
          author: $(anchor).find('.product-attributes > .product-producer').text().split(',') || [],
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('[data-type="product-url"]').attr('href'),
    );
  }
}
