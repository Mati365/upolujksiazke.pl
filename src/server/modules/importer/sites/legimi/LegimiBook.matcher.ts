import {fuzzyFindMatchingBook} from '@importer/kinds/scrappers/helpers/fuzzyFindBookAnchor';
import {
  buildURL,
  concatUrls,
} from '@shared/helpers';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

type LegimiSearchBook = {
  title: string,
  author: string,
  url?: string,
};

/**
 * @export
 * @class LegimiBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, DefaultUrlsConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class LegimiBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, DefaultUrlsConfig> {
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
    const books = await this.fetchSearchBooksList(title, 15);
    const matchedBook = fuzzyFindMatchingBook(
      {
        items: books,
        book: {
          title,
          author: authors[0].name,
        },
      },
    );

    return matchedBook?.url && this.fetchPageByPath(matchedBook.url);
  }

  /**
   * Performs API call to legimi search
   *
   * @private
   * @param {string} phrase
   * @param {number} [limit=15]
   * @return {Promise<LegimiSearchBook[]>}
   * @memberof LegimiBookMatcher
   */
  private async fetchSearchBooksList(phrase: string, limit: number = 15): Promise<LegimiSearchBook[]> {
    const {books, paperBooks} = await fetch(
      buildURL(
        concatUrls(this.homepageURL, 'api/search'),
        {
          searchPhrase: phrase,
          limit,
        },
      ),
    ).then((r) => r.json());

    return [
      ...(books || []),
      ...(paperBooks || []),
    ];
  }
}
