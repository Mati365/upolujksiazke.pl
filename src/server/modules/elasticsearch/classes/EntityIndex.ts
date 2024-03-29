import {Logger, OnModuleInit} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import chalk from 'chalk';
import * as R from 'ramda';

import {getCurrentTimestampSuffix} from '@server/common/helpers';
import {isDevMode, safeToString} from '@shared/helpers';

import {CanBePromise, ListItem} from '@shared/types';
import {MeasureCallDuration} from '@server/common/helpers/decorators';

export type EsIdNamePair = ListItem;

export type EsImageAttachment = {
  version: string,
  ratio: number,
  nsfw: boolean,
  attachment: {
    file: string,
  },
};

export const PredefinedProperties = Object.freeze(
  {
    idNamePair: {
      type: 'nested',
      properties: {
        id: {type: 'keyword'},
        name: {type: 'keyword'},
        parameterizedName: {type: 'keyword'},
      },
    },

    customIdNamePair: (properties: any) => R.mergeDeepLeft(
      PredefinedProperties.idNamePair,
      {
        properties,
      },
    ),

    imageAttachment: {
      type: 'nested',
      properties: {
        version: {type: 'keyword'},
        ratio: {type: 'float'},
        nsfw: {type: 'boolean'},
        attachment: {
          type: 'nested',
          properties: {
            file: {type: 'keyword'},
          },
        },
      },
    },
  },
);

export type EsIndexIdentifier = {
  name: string,
};

export type EsMappedDoc<I> = I & {
  _id: number,
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
export abstract class EntityIndex<E extends {id: number}, I = E> implements OnModuleInit {
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
      await this.reindexAllEntities();
    }
  }

  abstract createIndex(): Promise<void>;
  protected abstract mapRecord(entity: E): CanBePromise<EsMappedDoc<I>>;

  protected abstract findEntities(id: number[]): CanBePromise<E[]>;
  protected abstract findEntitiesIds(): AsyncGenerator<number[]>;

  /**
   * Returns single record by id
   *
   * @param {(string|number)} id
   * @param {*} options
   * @returns {Promise<I>}
   * @memberof EntityIndex
   */
  async getByID(id: string | number, options?: any): Promise<I> {
    const {es, indexName} = this;

    try {
      const response = await es.get(
        {
          index: indexName,
          id: safeToString(id),
          ...options,
        },
      );

      return response?.body?._source;
    } catch (e) {
      return null;
    }
  }

  /**
   * Performs ES search
   *
   * @param {*} body
   * @returns
   * @memberof EntityIndex
   */
  async search(body: any) {
    const {es, indexName, logger} = this;

    if (isDevMode())
      logger.debug(`ES query ${JSON.stringify(body)}`);

    const response = await es.search(
      {
        index: indexName,
        body,
      },
    );

    return response?.body;
  }

  /**
   * Executes search and picks hits
   *
   * @param {*} body
   * @returns
   * @memberof EntityIndex
   */
  async searchHits(body: any): Promise<any[]> {
    return (await this.search(body))?.hits?.hits || [];
  }

  /**
   * Returns array of found ids
   *
   * @param {*} body
   * @returns {string[]}
   * @memberof EntityIndex
   */
  async searchIds(body: any): Promise<string[]> {
    return R.pluck(
      '_id' as any,
      await this.searchHits(body),
    );
  }

  /**
   * Search data with aggregations
   *
   * @param {*} body
   * @returns
   * @memberof EntityIndex
   */
  async searchIdsWithAggs(body: any) {
    const result = await this.search(body);
    if (!result)
      return null;

    return {
      ids: R.pluck('_id' as any, result.hits?.hits || []),
      aggs: result.aggregations,
      total: result.hits?.total?.value,
    };
  }

  /**
   * Removes entities from ES
   *
   * @param {number[]} esIds
   * @memberof EntityIndex
   */
  async deleteEntities(esIds: number[]) {
    const {logger, es} = this;

    logger.log(`Deleting records with esIDs: ${chalk.bold(esIds.join(','))}!`);
    await es.deleteByQuery(
      {
        index: this.indexName,
        body: {
          query: {
            terms: {
              _id: esIds,
            },
          },
        },
      },
    );
  }

  /**
   * Reindex single record
   *
   * @param {number} id
   * @memberof EntityIndex
   */
  async reindexEntity(id: number) {
    const {es, logger} = this;
    const {_id: esId, ...body} = await this.mapRecord(
      (await this.findEntities([id]))[0],
    );

    logger.log(`Indexing ${chalk.bold(id)} (esID: ${chalk.bold(esId)}) record!`);
    await es.index(
      {
        id: safeToString(esId),
        index: this.indexName,
        body,
      },
    );
  }

  /**
   * Reindex multiple entities at once
   *
   * @param {number[]} ids
   * @param {string} [indexName=this.indexName]
   * @memberof EntityIndex
   */
  async reindexBulk(ids: number[], indexName: string = this.indexName) {
    const {es} = this;
    const mapped = await this.findAndMap(ids);

    await es.bulk(
      {
        refresh: true,
        body: mapped.flatMap(
          ({_id, ...doc}) => [
            {
              index: {
                _index: indexName,
                _id,
              },
            },
            doc,
          ],
        ),
      },
    );
  }

  /**
   * Finds multiple records by ids and maps
   *
   * @param {number[]} ids
   * @returns
   * @memberof EntityIndex
   */
  async findAndMap(ids: number[]) {
    return (await this.findEntities(ids)).map(this.mapRecord.bind(this));
  }

  /**
   * Reindexes whole table, creates new alias, indexes it and changes alias
   *
   * @returns {Promise<void>}
   * @memberof EntityIndex
   */
  @MeasureCallDuration('reindexAllEntities')
  async reindexAllEntities(): Promise<void> {
    const {es, indexName} = this;
    const newIndexName = `${indexName}_${getCurrentTimestampSuffix()}`;

    try {
      const clonedIndex = await this.cloneAndCreateIndex(newIndexName);

      for await (const ids of this.findEntitiesIds())
        await this.reindexBulk(ids, clonedIndex.indexName);

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
    } catch (e) {
      await es.indices.delete(
        {
          index: newIndexName,
          ignore_unavailable: true,
        },
      );

      throw e;
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
