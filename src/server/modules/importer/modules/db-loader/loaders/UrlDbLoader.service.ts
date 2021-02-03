import {Injectable, Logger} from '@nestjs/common';
import chalk from 'chalk';
import * as R from 'ramda';

import {isURLPathMatcher} from '../../scrapper/service/shared';

import {ScrapperMetadataEntity} from '../../scrapper/entity/ScrapperMetadata.entity';
import {ScrapperService} from '../../scrapper/service/Scrapper.service';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class UrlDbLoader implements MetadataDbLoader {
  private readonly logger = new Logger(UrlDbLoader.name);

  constructor(
    private readonly scrapperService: ScrapperService,
  ) {}

  /**
   * Extract resource by URL to DB
   *
   * @param {string} url
   * @returns
   * @memberof UrlDbLoader
   */
  extractUrlToDb(url: string) {
    const {logger, scrapperService} = this;
    const scrappersGroup = scrapperService.getScrappersGroupByWebsiteURL(url);
    if (!scrappersGroup || !isURLPathMatcher(scrappersGroup)) {
      logger.warn(`Cannot find ${chalk.bold(url)} scrapper!`);
      return null;
    }

    const kind = scrappersGroup.matchResourceKindByPath(
      R.tail(new URL(url).pathname),
    );

    if (R.isNil(kind)) {
      logger.warn(`Unknown kind of resource on ${chalk.bold(url)}!`);
      return null;
    }

    logger.log(`Found ${chalk.bold(url)} (kind: ${chalk.bold(kind)}) matcher! Trying to load!`);
    return null;
  }

  /**
   * @inheritdoc
   */
  extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    return this.extractUrlToDb(metadata.url);
  }
}
