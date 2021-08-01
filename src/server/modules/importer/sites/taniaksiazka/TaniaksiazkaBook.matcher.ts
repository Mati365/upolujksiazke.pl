import {fuzzyFindBookAnchor} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

/**
 * @export
 * @class TaniaksiazkaBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, DefaultUrlsConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class TaniaksiazkaBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, DefaultUrlsConfig> {
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
   * @inheritdoc
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(`q-${encodeURIComponent(title)}`))?.$;
    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('#pagi-slide > li > .product-container > .product-main > .product-main-top > .product-main-top-info'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('h2 > a[data-name]').data('name'),
          author: (
            $(anchor)
              .find('.product-authors > a')
              .toArray()
              .map((el: cheerio.Element) => $(el).text()) || []
          ),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('h2 > a').attr('href'),
    );
  }
}
