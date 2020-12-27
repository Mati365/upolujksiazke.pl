import {Injectable} from '@nestjs/common';
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
   * @param {ScrapperMetadataEntity[]} items
   * @returns
   * @memberof MetadataDbLoaderService
   */
  addBulkMetadataToQueue(items: ScrapperMetadataEntity[]) {
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
   * @param {ScrapperMetadataEntity} {id}
   * @returns
   * @memberof MetadataDbLoaderService
   */
  addMetadataToQueue(item: ScrapperMetadataEntity) {
    return this.addBulkMetadataToQueue([item]);
  }
}
