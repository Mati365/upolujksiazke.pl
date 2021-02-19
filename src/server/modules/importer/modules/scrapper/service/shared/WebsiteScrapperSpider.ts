import {matchByRegex, RegExpMatchArray} from '@shared/helpers';

import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {
  CrawlerConfig, CrawlerLink, SpiderCrawler,
  SitemapCrawler, CrawlerLinksMapperAttrs, Crawler,
} from '@spider/crawlers';

import {ScrapperMetadataQueueDriver} from '@spider/drivers/DbQueue.driver';
import {ScrapperMetadataKind} from '../../entity/ScrapperMetadata.entity';
import {WebsiteInfoScrapperService} from '../WebsiteInfoScrapper.service';
import {ScrapperGroupChild} from './WebsiteScrappersGroup';

export enum ScrapperPriority {
  PAGINATION = 5,
  NEXT_PAGINATION_PAGE = 6,
}

export interface URLPathMatcher {
  /**
   * Returns kind of type based on path - it is used primarly in spider
   *
   * @abstract
   * @param {string} path
   * @returns {ScrapperMetadataKind}
   * @memberof WebsiteScrappersGroup
   */
  matchResourceKindByPath(path: string): ScrapperMetadataKind;
}

export type WebsiteSpiderScrapperRunConfig = {
  websiteInfoService: WebsiteInfoScrapperService,
  tmpDirService: TmpDirService,
  dbQueueDriver: ScrapperMetadataQueueDriver,
  crawlerConfig?: Partial<CrawlerConfig>,
};

/**
 * Abstract interface for website spider
 *
 * @export
 * @abstract
 * @class WebsiteScrapperSpider
 * @extends {ScrapperGroupChild}
 * @implements {URLPathMatcher}
 */
export abstract class WebsiteScrapperSpider extends ScrapperGroupChild implements URLPathMatcher {
  public static readonly RESOURCE_PRIORITY: Record<ScrapperMetadataKind, number> = {
    [ScrapperMetadataKind.BOOK]: 7,
    [ScrapperMetadataKind.BOOK_REVIEW]: 3,
    [ScrapperMetadataKind.BOOK_AUTHOR]: 2,
    [ScrapperMetadataKind.BOOK_PUBLISHER]: 2,
    [ScrapperMetadataKind.URL]: 0,
  };

  /**
   * @inheritdoc
   */
  abstract matchResourceKindByPath(path: string): ScrapperMetadataKind;

  /**
   * Calculates how attractive to spider is path
   *
   * @param {string} path
   * @memberof WebsiteScrapperSpider
   */
  getPathPriority(path: string): number {
    const kind = this.matchResourceKindByPath(path);

    return WebsiteScrapperSpider.RESOURCE_PRIORITY[kind] ?? 0;
  }

  /**
   * Maps links array, it is not used here but maybe in other websites so
   * It is used primarly for bad written websites when we need to generate some links
   *
   * @param {CrawlerLinksMapperAttrs} {links}
   * @returns {CrawlerLink[]}
   * @memberof WebsiteScrapperSpider
   */
  extractFollowLinks({links}: CrawlerLinksMapperAttrs): CrawlerLink[] {
    return links;
  }

  /**
   * Start spider
   *
   * @param {WebsiteSpiderScrapperRunConfig} attrs
   * @returns
   * @memberof ScrapperSpider
   */
  async run$(
    {
      tmpDirService,
      websiteInfoService,
      crawlerConfig,
      dbQueueDriver,
    }: WebsiteSpiderScrapperRunConfig,
  ) {
    const {group} = this;
    const queueDriver = dbQueueDriver.createWebsiteIndexedQueue(
      {
        website: await websiteInfoService.findOrCreateWebsiteEntity(group.websiteInfoScrapper),
      },
    );

    const sharedConfig: CrawlerConfig = {
      queueDriver,
      delay: 8000,
      storeOnlyPaths: true,
      shouldBe: {
        analyzed: ({queueItem}) => queueItem.priority > 0,
      },
      preMapLink: (path) => new CrawlerLink(
        path,
        this.getPathPriority(path),
      ),
      ...crawlerConfig,
    };

    let crawler: Crawler = await SitemapCrawler.createIfSitemapPresent(
      queueDriver.website.url,
      {
        tmpDirService,
        ...sharedConfig,
      },
    );

    if (!crawler) {
      crawler = new SpiderCrawler(
        {
          defaultUrl: queueDriver.website.url,
          extractFollowLinks: this.extractFollowLinks.bind(this),
          ...sharedConfig,
        },
      );
    }

    return crawler.run$();
  }
}

/**
 * Simple spider that only maps URLs
 *
 * @export
 * @class SimpleWebsiteScrapperSpider
 * @extends {WebsiteScrapperSpider}
 */
export class SimpleWebsiteScrapperSpider extends WebsiteScrapperSpider {
  constructor(
    private readonly regexMap: RegExpMatchArray<number>,
  ) {
    super();
  }

  /**
   * @inheritdoc
   */
  matchResourceKindByPath(path: string): ScrapperMetadataKind {
    return matchByRegex(this.regexMap, path);
  }

  /**
   * Creates new instance of spider
   *
   * @static
   * @param {RegExpMatchArray<number>} regexMap
   * @returns
   * @memberof SimpleWebsiteScrapperSpider
   */
  static createForRegexMap(regexMap: RegExpMatchArray<number>) {
    return new SimpleWebsiteScrapperSpider(regexMap);
  }
}
