import {Injectable, Logger} from '@nestjs/common';
import chalk from 'chalk';

import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../scrapper/entity';
import {BookReviewDbLoader} from '../loaders';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class MetadataDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(MetadataDbLoaderService.name);
  private readonly resourceLoaders: Record<ScrapperMetadataKind, MetadataDbLoader>;

  constructor(
    readonly bookReviewDbLoader: BookReviewDbLoader,
  ) {
    this.resourceLoaders = {
      [ScrapperMetadataKind.BOOK_REVIEW]: bookReviewDbLoader,
    };
  }

  /**
   * Main db loader method, loads scrapper result into db
   *
   * @param {ScrapperMetadataEntity} metadata
   * @memberof MetadataDbLoaderService
   */
  async loadMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {logger, resourceLoaders} = this;
    const loader = resourceLoaders[metadata.kind];

    if (!loader)
      throw new Error('Unknown entity loader!');

    logger.warn(`Loading metadata entity with ID: ${chalk.bold(metadata.id)} to DB!`);
    await loader.loadMetadataToDb(metadata);
  }
}
