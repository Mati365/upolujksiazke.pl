import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';

import {ScrapperMetadataEntity} from '../../scrapper/entity';
import {InlineMetadataObject} from '../MetadataDbLoader.interface';
import {
  DbLoaderQueue,
  SCRAPPER_METADATA_LOADER_QUEUE,
} from '../processors/MetadataDbLoaderConsumer.processor';

export type DbLoaderItem = ScrapperMetadataEntity | InlineMetadataObject;

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
   * @param {DbLoaderItem[]} items
   * @param {boolean} [mergeToOneJob]
   * @returns
   * @memberof MetadataDbLoaderQueueService
   */
  addBulkMetadataToQueue(items: DbLoaderItem[], mergeToOneJob?: boolean) {
    const {dbLoaderQueue} = this;
    const mappedItems = (
      items
        .filter(Boolean)
        .map((item) => {
          if (item instanceof ScrapperMetadataEntity) {
            return {
              metadataId: item.id,
            };
          }

          return item;
        })
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
   * @param {DbLoaderItem} {id}
   * @returns
   * @memberof MetadataDbLoaderService
   */
  addMetadataToQueue(item: DbLoaderItem) {
    return this.addBulkMetadataToQueue([item]);
  }
}
