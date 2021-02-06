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
   * @see
   *  Do not use mergeToOneJob in scrappers due to limit issues
   *
   * @param {ScrapperMetadataEntity[]} items
   * @param {boolean} [mergeToOneJob]
   * @returns
   * @memberof MetadataDbLoaderQueueService
   */
  addBulkMetadataToQueue(items: ScrapperMetadataEntity[], mergeToOneJob?: boolean) {
    const {dbLoaderQueue} = this;
    const mappedItems = (
      items
        .filter(Boolean)
        .map(
          ({id}) => ({
            metadataId: id,
          }),
        )
    );

    if (mergeToOneJob)
      return dbLoaderQueue.add(mappedItems);

    return dbLoaderQueue.addBulk(
      mappedItems.map((item) => ({
        data: [item],
      })),
    );
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
