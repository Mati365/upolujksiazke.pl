import {Logger, Injectable} from '@nestjs/common';
import {mergeMap} from 'rxjs/operators';
import {from} from 'rxjs';
import chalk from 'chalk';

import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {TmpDirService} from '@server/modules/tmp-dir/TmpDir.service';
import {
  WebsiteInfoScrapperService,
  ScrapperService,
} from '@scrapper/service';

import {UrlDbLoaderService} from '@importer/kinds/db-loaders';
import {WebsiteScrappersGroup} from '../../scrapper/service/shared/WebsiteScrappersGroup';
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
    private readonly tmpDirService: TmpDirService,
    private readonly urlDbLoaderService: UrlDbLoaderService,
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
    if (!group?.spider)
      throw new Error('Provied scrappers group does not contain spider!');

    const {
      websiteInfoService,
      urlDbLoaderService,
      tmpDirService,
      dbQueueDriver,
    } = this;

    const observable = await group.spider.run$(
      {
        tmpDirService,
        websiteInfoService,
        dbQueueDriver,
      },
    );

    await (
      observable
        .pipe(
          mergeMap(({parseResult}) => from(
            urlDbLoaderService.extractFetchedPageToDb(group, parseResult) || [],
          )),
        )
        .toPromise()
    );
  }
}
