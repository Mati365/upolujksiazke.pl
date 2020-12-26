import {Injectable} from '@nestjs/common';
import {EntityData} from '@mikro-orm/core';
import {InjectQueue} from '@nestjs/bull';

import {ScrapperMetadataEntity} from '../../scrapper/entity';
import {DbLoaderQueue, SCRAPPER_METADATA_LOADER_QUEUE} from '../processors/MetadataDbLoaderConsumer.processor';

@Injectable()
export class MetadataDbLoaderQueueService {
  constructor(
    @InjectQueue(SCRAPPER_METADATA_LOADER_QUEUE)
    private readonly dbLoaderQueue: DbLoaderQueue,
  ) {}

  /**
   * Adds array of metadata items into queue
   *
   * @param {EntityData<ScrapperMetadataEntity>[]} items
   * @returns
   * @memberof MetadataDbLoaderService
   */
  addBulkMetadataToQueue(items: EntityData<ScrapperMetadataEntity>[]) {
    const mappedItems = (
      items
        .filter(Boolean)
        .map(
          ({id}) => ({
            metadataId: id,
          }),
        )
    );

    return this.dbLoaderQueue.add(mappedItems);
  }

  /**
   * Add single item into queue
   *
   * @param {EntityData<ScrapperMetadataEntity>} {id}
   * @returns
   * @memberof MetadataDbLoaderService
   */
  addMetadataToQueue(item: EntityData<ScrapperMetadataEntity>) {
    return this.addBulkMetadataToQueue([item]);
  }
}
