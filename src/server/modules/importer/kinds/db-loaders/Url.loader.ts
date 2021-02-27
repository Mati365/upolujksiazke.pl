import {Inject, Injectable, Logger, forwardRef} from '@nestjs/common';
import chalk from 'chalk';
import * as R from 'ramda';

import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {WebsiteScrappersGroup} from '@scrapper/service/shared';
import {ScrapperMetadataEntity} from '@scrapper/entity/ScrapperMetadata.entity';
import {ScrapperService} from '@scrapper/service/Scrapper.service';
import {MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';
import {MetadataDbLoaderService} from '@db-loader/services/MetadataDbLoader.service';

@Injectable()
export class UrlDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(UrlDbLoaderService.name);

  constructor(
    @Inject(forwardRef(() => MetadataDbLoaderService))
    private readonly metadataDbLoaderService: MetadataDbLoaderService,
    private readonly scrapperService: ScrapperService,
  ) {}

  /**
   * @inheritdoc
   */
  async extractMetadataToDb({url}: ScrapperMetadataEntity) {
    await this.extractParseResultToDb(
      await parseAsyncURLIfOK(url),
    );
  }

  /**
   * Extract resource by URL to DB
   *
   * @param {AsyncURLParseResult} result
   * @returns
   * @memberof UrlDbLoaderService
   */
  async extractParseResultToDb(page: AsyncURLParseResult) {
    if (!page)
      return;

    const {url} = page;
    const {scrapperService} = this;

    const scrappersGroup = scrapperService.getScrappersGroupByWebsiteURL(url);
    if (!scrappersGroup?.spider)
      throw new Error(`Scrapper ${chalk.bold(url)} must contain spider!`);

    await this.extractFetchedPageToDb(scrappersGroup, page);
  }

  /**
   * Loads fetched page (not parsed) to database
   *
   * @param {WebsiteScrappersGroup} group
   * @param {AsyncURLParseResult} parseResult
   * @memberof MetadataDbLoaderService
   */
  async extractFetchedPageToDb(group: WebsiteScrappersGroup, parseResult: AsyncURLParseResult) {
    const {metadataDbLoaderService, logger} = this;
    const {url} = parseResult;
    const kind = group.spider.matchResourceKindByPath(url);

    if (R.isNil(kind))
      throw new Error(`Unknown link ${url} kind!`);

    const loader = metadataDbLoaderService.resourceLoaders[kind];
    if (!loader)
      throw new Error(`Unknown link ${url} loader!`);

    const parser = group.parsers[kind];
    if (!parser)
      throw new Error(`Unknown link ${url} parser!`);

    const content = await parser.parse(parseResult);
    if (!content) {
      logger.warn(`Missing ${chalk.bold(url)} parser content result!`);
      return;
    }

    await loader.extractMetadataToDb(
      new ScrapperMetadataEntity(
        {
          kind,
          content,
        },
      ),
    );
  }
}
