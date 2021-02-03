import {Injectable, Logger} from '@nestjs/common';
import chalk from 'chalk';

import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../scrapper/entity';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {
  BookDbLoader,
  BookReviewDbLoader,
} from '../loaders';

@Injectable()
export class MetadataDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(MetadataDbLoaderService.name);
  private readonly resourceLoaders: Record<ScrapperMetadataKind, MetadataDbLoader>;

  constructor(
    readonly bookReviewDbLoader: BookReviewDbLoader,
    readonly bookDbLoader: BookDbLoader,
  ) {
    this.resourceLoaders = {
      [ScrapperMetadataKind.URL]: null,
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

    logger.warn(`Loading metadata entity with ID: ${chalk.bold(metadata.id)} to DB!`);
    await loader.extractMetadataToDb(metadata);
  }
}
