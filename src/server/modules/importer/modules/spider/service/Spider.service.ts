import {Logger, Injectable} from '@nestjs/common';
import {mergeMap} from 'rxjs/operators';
import {from} from 'rxjs';
import chalk from 'chalk';

import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {
  WebsiteInfoScrapperService,
  ScrapperService,
} from '@scrapper/service';

import {WebsiteScrappersGroup, isURLPathMatcher} from '../../scrapper/service/shared/WebsiteScrappersGroup';
import {CrawlerPageResult, SpiderCrawler} from '../crawlers';
import {ScrapperMetadataQueueDriver} from '../drivers/DbQueue.driver';

/**
 * Automatic URL analyzer and spider
 *
 * @export
 * @class SpiderService
 */
@Injectable()
export class SpiderService {
  private readonly logger = new Logger(SpiderService.name);

  constructor(
    private readonly scrapperService: ScrapperService,
    private readonly websiteInfoService: WebsiteInfoScrapperService,
    private readonly dbQueueDriver: ScrapperMetadataQueueDriver,
  ) {}

  /**
   * Start spider for all websites
   *
   * @todo
   *  Add support for all scrappers
   *
   * @memberof SpiderService
   */
  async run() {
    const {scrapperService} = this;

    await this.runForScrappersGroup(scrapperService.scrappersGroups[0]);
  }

  /**
   * Starts spider on provided website
   *
   * @todo
   *  Detect if page has sitemap!
   *
   * @param {WebsiteScrappersGroup} scrappersGroup
   * @returns
   * @memberof SpiderService
   */
  @InterceptMethod(
    function loggerWrapper(
      this: SpiderService,
      scrappersGroup: WebsiteScrappersGroup,
    ) {
      const {logger} = this;

      logger.log(`Fetching ${chalk.bold(scrappersGroup.websiteURL)}!`);
    },
  )
  async runForScrappersGroup(group: WebsiteScrappersGroup) {
    if (!group || !isURLPathMatcher(group))
      throw new Error('Provied scrappers group is not url path matcher!');

    const {
      websiteInfoService,
      dbQueueDriver,
    } = this;

    const website = await websiteInfoService.findOrCreateWebsiteEntity(group.websiteInfoScrapper);
    const crawler = new SpiderCrawler(
      {
        storeOnlyPaths: true,
        shouldBe: {
          analyzed: (url) => group.matchResourceKindByPath(url) !== null,
        },
        queueDriver: dbQueueDriver.createIndexedQueue(
          {
            website,
          },
        ),
      },
    );

    await (
      crawler
        .run$(
          {
            defaultUrl: website.url,
          },
        )
        .pipe(mergeMap((data) => from(this.parseScrappedData(data) || [])))
        .toPromise()
    );
  }

  /**
   * Analyze fetched data
   *
   * @param {CrawlerPageResult} data
   * @memberof SpiderService
   */
  parseScrappedData({followPaths}: CrawlerPageResult) {
    console.info(followPaths);
    return null;
  }
}
