import {Logger} from '@nestjs/common';
import {Processor, Process, OnQueueActive} from '@nestjs/bull';
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/postgresql';
import {Job, Queue} from 'bull';

import {ID} from '@shared/types';
import {ScrapperMetadataEntity} from '../../scrapper/entity';
// import {WebsiteScrapperItemInfo} from '../../scrapper/service/shared';

export const SCRAPPER_METADATA_LOADER_QUEUE = 'scrapper_metadata_loader';

export type DbLoaderJobValue = {
  metadataId: ID,
};

export type DbLoaderQueue = Queue<DbLoaderJobValue>;

/**
 * Processor that imports all metadata to database
 *
 * @export
 * @class MetadataDbLoaderConsumerProcessor
 */
@Processor(SCRAPPER_METADATA_LOADER_QUEUE)
export class MetadataDbLoaderConsumerProcessor {
  private readonly logger = new Logger(MetadataDbLoaderConsumerProcessor.name);

  constructor(
    @InjectRepository(ScrapperMetadataEntity)
    private readonly metadataRepository: EntityRepository<ScrapperMetadataEntity>,
  ) {}

  @OnQueueActive()
  onActive(job: Job<DbLoaderJobValue>) {
    const {metadataId} = job.data;

    this.logger.log(
      `Processing job ${job.id} with metadata item (id: ${metadataId})...`,
    );
  }

  @Process()
  async process(job: Job<DbLoaderJobValue>) {
    const {metadataRepository, logger} = this;

    const {metadataId} = job.data;
    const metadata = await metadataRepository.findOne(+metadataId);
    if (!metadata) {
      logger.warn(`Metadata item with ID: ${metadataId} is not present! Skipping!`);
      return;
    }

    console.info(metadata.content);
  }
}
