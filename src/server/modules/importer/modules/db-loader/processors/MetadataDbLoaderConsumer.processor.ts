import {Logger} from '@nestjs/common';
import {Processor, Process, OnQueueActive, OnQueueCompleted} from '@nestjs/bull';
import {In} from 'typeorm';
import {Job, Queue} from 'bull';
import pMap from 'p-map';
import * as R from 'ramda';

import {ScrapperMetadataEntity} from '../../scrapper/entity';
import {MetadataDbLoaderService} from '../services/MetadataDbLoader.service';
import {InlineMetadataObject} from '../MetadataDbLoader.interface';

export const SCRAPPER_METADATA_LOADER_QUEUE = 'scrapper_metadata_loader';

export type DbStoredLoaderMetadata = {
  metadataId: number,
};

export type DbLoaderJobValue = (DbStoredLoaderMetadata | InlineMetadataObject)[];

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
    private readonly metadataDbLoaderService: MetadataDbLoaderService,
  ) {}

  /**
   * On start firs record extract
   *
   * @param {Job<DbLoaderJobValue>} job
   * @memberof MetadataDbLoaderConsumerProcessor
   */
  @OnQueueActive()
  onActive(job: Job<DbLoaderJobValue>) {
    this.logger.log(
      `Processing job ${job.id} with ${job.data.length} metadata items...`,
    );
  }

  /**
   * Extract single record
   *
   * @param {Job<DbLoaderJobValue>} job
   * @returns
   * @memberof MetadataDbLoaderConsumerProcessor
   */
  @Process()
  async process(job: Job<DbLoaderJobValue>) {
    const {metadataDbLoaderService} = this;

    const dbMetadataIds = R.pluck('metadataId', <DbStoredLoaderMetadata[]> job.data).filter(Boolean);
    const metadataItems: InlineMetadataObject[] = [
      ...R.filter(
        (item) => !('metadataId' in item),
        job.data,
      ) as InlineMetadataObject[],

      ...!dbMetadataIds.length ? [] : await ScrapperMetadataEntity.find(
        {
          where: {
            id: In(dbMetadataIds),
          },
        },
      ),
    ];

    await pMap(
      metadataItems,
      async (item) => {
        try {
          await metadataDbLoaderService.extractMetadataToDb(item);
        } catch (e) {
          console.error(e);
        }
      },
      {
        concurrency: 5,
      },
    );
  }

  /**
   * Done logs
   *
   * @param {Job<DbLoaderJobValue>} job
   * @memberof MetadataDbLoaderConsumerProcessor
   */
  @OnQueueCompleted()
  onCompleted(job: Job<DbLoaderJobValue>) {
    this.logger.log(
      `Job ${job.id} with ${job.data.length} metadata items has been processed!`,
    );
  }
}
