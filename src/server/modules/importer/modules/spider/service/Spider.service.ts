import {Logger, Injectable} from '@nestjs/common';
import chalk from 'chalk';

import {extractPathname} from '@shared/helpers/urlExtract';
import {concatUrls} from '@shared/helpers/concatUrls';

import {ID} from '@shared/types';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity/RemoteWebsite.entity';
import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {
  WebsiteInfoScrapperService,
  ScrapperService,
} from '@scrapper/service';

import {isURLPathMatcher, WebsiteScrappersGroup} from '../../scrapper/service/shared/WebsiteScrappersGroup';
import {SpiderCrawler} from '../crawlers';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../scrapper/entity/ScrapperMetadata.entity';

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

    const {websiteInfoService} = this;
    const website = await websiteInfoService.findOrCreateWebsiteEntity(group.websiteInfoScrapper);
    const crawler = new SpiderCrawler(
      {
        startPageURL: await this.getStartCrawlerURL(website),
        shouldBeScrapped: (url) => group.matchResourceKindByPath(url) !== null,
        cache: {
          isAlreadyScrapped: (url) => this.isURLAlreadyCrawled(website.id, url),
          parseScrappedData: this.parseScrappedData.bind(this),
        },
      },
    );

    return crawler.run();
  }

  /**
   * Analyze fetched data
   *
   * @param {AsyncURLParseResult} data
   * @memberof SpiderService
   */
  parseScrappedData(data: AsyncURLParseResult) {
    console.info(data);
  }

  /**
   * Get start spider address
   *
   * @param {RemoteWebsiteEntity} website
   * @returns
   * @memberof SpiderService
   */
  async getStartCrawlerURL(website: RemoteWebsiteEntity) {
    const entity = await ScrapperMetadataEntity.findOne(
      {
        order: {
          createdAt: 'DESC',
        },
        where: {
          kind: ScrapperMetadataKind.URL,
          websiteId: website.id,
        },
      },
    );

    return concatUrls(
      website.url,
      entity?.remoteId || '',
    );
  }

  /**
   * Checks if spider already checked url
   *
   * @param {ID} websiteId
   * @param {string} url
   * @returns
   * @memberof SpiderService
   */
  async isURLAlreadyCrawled(websiteId: ID, url: string) {
    const metadata = await ScrapperMetadataEntity.findOne(
      {
        select: ['id'],
        where: {
          kind: ScrapperMetadataKind.URL,
          remoteId: extractPathname(url),
          websiteId,
        },
      },
    );

    return !!metadata;
  }
}
