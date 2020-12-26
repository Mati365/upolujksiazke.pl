import {Injectable, Logger} from '@nestjs/common';
import chalk from 'chalk';

import {ScrapperMetadataEntity} from '../../scrapper/entity';

@Injectable()
export class MetadataDbLoaderService {
  private readonly logger = new Logger(MetadataDbLoaderService.name);

  /**
   * Main db loader method, loads scrapper result into db
   *
   * @param {ScrapperMetadataEntity} metadata
   * @memberof MetadataDbLoaderService
   */
  loadMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {logger} = this;

    logger.warn(`Loading metadata entity with ID: ${chalk.bold(metadata.id)} to DB!`);
  }
}
