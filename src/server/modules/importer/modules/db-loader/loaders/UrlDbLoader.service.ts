import {Inject, Injectable, Logger, forwardRef} from '@nestjs/common';
import chalk from 'chalk';
import * as R from 'ramda';

import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {isURLPathMatcher} from '../../scrapper/service/shared';

import {ScrapperMetadataEntity} from '../../scrapper/entity/ScrapperMetadata.entity';
import {ScrapperService} from '../../scrapper/service/Scrapper.service';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {MetadataDbLoaderService} from '../services/MetadataDbLoader.service';

@Injectable()
export class UrlDbLoader implements MetadataDbLoader {
  private readonly logger = new Logger(UrlDbLoader.name);

  constructor(
    @Inject(forwardRef(() => MetadataDbLoaderService))
    private readonly metadataDbLoaderService: MetadataDbLoaderService,
    private readonly scrapperService: ScrapperService,
  ) {}

  /**
   * @inheritdoc
   */
  async extractMetadataToDb({url}: ScrapperMetadataEntity) {
    const dto = await this.getURLResourceDTO(
      await parseAsyncURLIfOK(url),
    );

    return this.metadataDbLoaderService.extractMetadataToDb(dto);
  }

  /**
   * Extract resource by URL to DB
   *
   * @param {AsyncURLParseResult} result
   * @returns
   * @memberof UrlDbLoader
   */
  async getURLResourceDTO(page: AsyncURLParseResult) {
    if (!page)
      return null;

    const {url} = page;
    const {
      logger,
      scrapperService,
    } = this;

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

    return new ScrapperMetadataEntity(
      {
        kind,
        content: await (
          scrappersGroup
            .parsers[kind]
            .parse(page)
        ),
      },
    );
  }
}
