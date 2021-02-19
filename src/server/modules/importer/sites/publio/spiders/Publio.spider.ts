import {matchByRegex, RegExpMatchArray} from '@shared/helpers/matchByRegex';

import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';
import {
  ScrapperPriority,
  SimpleWebsiteScrapperSpider,
} from '@scrapper/service/shared/WebsiteScrapperSpider';

import {
  CrawlerLink,
  CrawlerLinksMapperAttrs,
} from '@importer/modules/spider/crawlers';

export class PublioSpider extends SimpleWebsiteScrapperSpider {
  public static readonly URL_REGEX = Object.freeze(
    {
      book: /,p\d+.html$/,
      categoryBooks: /,k\d+(?:,strona\d+)?.html$/,
      seriesBooks: /,s\d+(?:,strona\d+)?.html$/,
      publisherBooks: /,w\d+(?:,strona\d+)?.html$/,
      indexBooks: /e-booki(?:,strona\d+)?.html$/,
    },
  );

  public static readonly OPT_URL_PRIORITY_MATCHER_REGEXS: Readonly<RegExpMatchArray<number>> = Object.freeze(
    [
      [PublioSpider.URL_REGEX.categoryBooks, () => ScrapperPriority.PAGINATION],
      [PublioSpider.URL_REGEX.publisherBooks, () => ScrapperPriority.PAGINATION],
      [PublioSpider.URL_REGEX.indexBooks, () => ScrapperPriority.PAGINATION],
      [PublioSpider.URL_REGEX.seriesBooks, () => ScrapperPriority.PAGINATION],
    ],
  );

  constructor() {
    super(
      [
        [PublioSpider.URL_REGEX.book, () => ScrapperMetadataKind.BOOK],
      ],
    );
  }

  /**
   * @inheritdoc
   */
  getPathPriority(path: string): number {
    const priority = matchByRegex(
      PublioSpider.OPT_URL_PRIORITY_MATCHER_REGEXS,
      path,
    );

    return priority ?? super.getPathPriority(path);
  }

  /**
   * Just fix broken navigation
   *
   * @inheritdoc
   */
  extractFollowLinks({link, links, parseResult}: CrawlerLinksMapperAttrs): CrawlerLink[] {
    if (!link.priority)
      return null;

    const {$} = parseResult;
    const hasNextPage = $(
      '.listing__products-filter-result .listing__products-filter-result__pagination ul li.page.active + .page',
    ).length > 0;

    if (hasNextPage) {
      const {url} = link;
      const pageNumber = (+url.match(/,strona(\d+)/)[1]) || 1;

      links.push(
        new CrawlerLink(
          PublioSpider.replacePaginationPage(url, pageNumber),
          ScrapperPriority.NEXT_PAGINATION_PAGE,
        ),
      );
    }

    return links;
  }

  /**
   * Inserts page number into url
   *
   * @static
   * @param {string} url
   * @param {number} page
   * @returns
   * @memberof PublioSpider
   */
  static replacePaginationPage(url: string, page: number) {
    return url.replace(/(?:,strona\d+)?.html$/, `,strona${page}.html`);
  }
}
