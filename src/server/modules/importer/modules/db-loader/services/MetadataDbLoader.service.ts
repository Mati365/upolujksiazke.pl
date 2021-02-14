import {Injectable, Logger} from '@nestjs/common';
import chalk from 'chalk';
import * as R from 'ramda';

import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../scrapper/entity';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {
  BookDbLoaderService,
  BookReviewDbLoaderService,
  UrlDbLoaderService,
} from '../loaders';

@Injectable()
export class MetadataDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(MetadataDbLoaderService.name);
  public readonly resourceLoaders: Record<ScrapperMetadataKind, MetadataDbLoader>;

  constructor(
    readonly bookReviewDbLoader: BookReviewDbLoaderService,
    readonly bookDbLoader: BookDbLoaderService,
    readonly urlDbLoader: UrlDbLoaderService,
  ) {
    this.resourceLoaders = {
      [ScrapperMetadataKind.URL]: urlDbLoader,
      [ScrapperMetadataKind.BOOK_REVIEW]: bookReviewDbLoader,
      [ScrapperMetadataKind.BOOK]: bookDbLoader,
      [ScrapperMetadataKind.BOOK_AUTHOR]: null,
      [ScrapperMetadataKind.BOOK_PUBLISHER]: null,
    };
  }

  /**
   * Main db loader method, loads scrapper result into db
   *
   * @param {ScrapperMetadataEntity} metadata
   * @memberof MetadataDbLoaderService
   */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {logger, resourceLoaders} = this;
    const loader = resourceLoaders[metadata.kind];

    if (!loader)
      throw new Error(`Unknown entity loader(kind: ${metadata.kind})!`);

    if (!R.isNil(metadata.id))
      logger.warn(`Loading metadata entity with ID: ${chalk.bold(metadata.id)} to DB!`);

    await loader.extractMetadataToDb(metadata);
  }
}
