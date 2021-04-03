import {Logger, OnModuleInit} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import chalk from 'chalk';
import pMap from 'p-map';
import * as R from 'ramda';

import {getCurrentTimestampSuffix} from '@server/common/helpers';
import {safeToString} from '@shared/helpers';

import {CanBePromise, ListItem} from '@shared/types';

export type EsIdNamePair = ListItem;

export const PredefinedProperties = Object.freeze(
  {
    idNamePair: {
      type: 'nested',
      properties: {
        id: {type: 'keyword'},
        name: {type: 'keyword'},
      },
    },
  },
);

export type EsIndexIdentifier = {
  name: string,
};

/**
 * Maps single database entity into ES index
 *
 * @export
 * @abstract
 * @class EntityIndex
 * @implements {OnModuleInit}
 * @template E database entity
 * @template I elasticsearch entity
 */
export abstract class EntityIndex<E extends {id: number}, I = any> implements OnModuleInit {
  protected readonly logger: Logger;

  constructor(
    protected readonly es: ElasticsearchService,
    protected readonly index: EsIndexIdentifier,
  ) {
    index.name = `uk_${index.name}`;

    this.logger = new Logger(`${EntityIndex.name}(${index.name})`);
  }

  get indexName() {
    return this.index.name;
  }

  async onModuleInit() {
    const {es, indexName, logger} = this;
    const {body: exists} = await es.indices.exists(
      {
        index: indexName,
      },
    );

    if (!exists) {
      logger.log(`Index ${chalk.bold(indexName)} does not exists! Creating index!`);
      await this.reindexAllRecords();
    }
  }

  abstract createIndex(): Promise<void>;
  abstract mapRecord(entity: E): CanBePromise<I>;

  abstract findEntity(id: number): CanBePromise<E>;
  abstract findEntitiesIds(): AsyncGenerator<number[]>;

  /**
   * Reindex single record
   *
   * @param {number} id
   * @memberof EntityIndex
   */
  async reindexRecord(id: number) {
    const {es, logger} = this;
    logger.log(`Indexing ${id} record!`);

    await es.index(
      {
        id: safeToString(id),
        index: this.indexName,
        body: await this.mapRecord(
          await this.findEntity(id),
        ),
      },
    );
  }

  /**
   * Reindexes whole table, creates new alias, indexes it and changes alias
   *
   * @returns {Promise<void>}
   * @memberof EntityIndex
   */
  async reindexAllRecords(): Promise<void> {
    const {es, indexName} = this;
    const idMapper = async (id: number) => this.mapRecord(
      await this.findEntity(id),
    );

    const clonedIndex = await this.cloneAndCreateIndex(
      `${indexName}_${getCurrentTimestampSuffix()}`,
    );

    for await (const ids of this.findEntitiesIds()) {
      const mapped = await pMap(
        ids,
        idMapper,
        {
          concurrency: 1,
        },
      );

      await es.bulk(
        {
          refresh: true,
          body: mapped.flatMap(
            (doc) => [
              {
                index: {
                  _index: clonedIndex.indexName,
                  _id: (<any> doc).id,
                },
              },
              doc,
            ],
          ),
        },
      );
    }

    // change alias
    const {body: prevAlias} = await es.indices.getAlias(
      {
        name: indexName,
      },
      {
        ignore: [404],
      },
    );

    await es.indices.putAlias(
      {
        name: indexName,
        index: clonedIndex.indexName,
      },
    );

    if (prevAlias.status !== 404) {
      const prevIndexes = R.keys(prevAlias);

      await es.indices.delete(
        {
          index: prevIndexes,
        },
      );
    }
  }

  /**
   * Create copy of current index
   *
   * @param {string} name
   * @returns {Promise<this>}
   * @memberof EntityIndex
   */
  async cloneAndCreateIndex(name: string): Promise<this> {
    const clonedIndex: this = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
      {
        index: {
          name,
        },
      } as Partial<EntityIndex<E>>,
    );

    await clonedIndex.createIndex();
    return clonedIndex;
  }
}
