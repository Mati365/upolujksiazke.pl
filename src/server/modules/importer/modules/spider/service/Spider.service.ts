import {Logger, Injectable} from '@nestjs/common';
import chalk from 'chalk';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {
  WebsiteInfoScrapperService,
  ScrapperService,
} from '@scrapper/service';

import {isURLPathMatcher, WebsiteScrappersGroup} from '../../scrapper/service/shared/WebsiteScrappersGroup';
import {SpiderCrawler} from '../crawlers';
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

    const queueDriver = dbQueueDriver.createQueue(
      {
        website: await websiteInfoService.findOrCreateWebsiteEntity(group.websiteInfoScrapper),
      },
    );

    const crawler = new SpiderCrawler(
      {
        queueDriver,
        shouldBeScrapped: (url) => group.matchResourceKindByPath(url) !== null,
      },
    );

    return (
      crawler
        .run()
        .subscribe(this.parseScrappedData.bind(this))
    );
  }

  /**
   * Analyze fetched data
   *
   * @param {AsyncURLParseResult} data
   * @memberof SpiderService
   */
  parseScrappedData({url}: AsyncURLParseResult) {
    console.info(`Analyze ${url}!`);
  }
}
