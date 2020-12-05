import {nestedPropPick} from '@shared/helpers';

import {CanBeArray, ID} from '@shared/types';
import {APIClient} from '../../utils/APIClient';
import {
  APIBulkTarget,
  APIPagination,
  APIValidatorResponse,
  BaseAPIRepo,
  CountResult,
  PaginationFilters,
} from './BaseAPIRepo';

import {transformFiltersToPlainObj} from '../helpers/transformFiltersToPlainObj';

export type BaseCrudEntity = {
  id?: ID,
  createdAt?: string,
  updatedAt?: string,
};

type CrudAPIRepoInitializer<F> = {
  filtersNestedPickWhitelist?: (keyof F)[],
  resourceName: string,
  api: APIClient,
};

export class CrudAPIRepo<
  Entity extends BaseCrudEntity,
  EntityPaginationFilters = PaginationFilters<any>,
> extends BaseAPIRepo<Entity> {
  public readonly resourceName: string;
  public readonly filtersNestedPickWhitelist: (keyof EntityPaginationFilters)[];

  constructor(
    {
      api,
      resourceName,
      filtersNestedPickWhitelist,
    }: CrudAPIRepoInitializer<EntityPaginationFilters>,
  ) {
    super(api);
    this.resourceName = resourceName;
    this.filtersNestedPickWhitelist = filtersNestedPickWhitelist;
  }

  /**
   * Validates single record
   *
   * @param {Partial<Entity>} entity
   * @returns {Promise<APIValidatorResponse<Entity>>}
   * @memberof CrudAPIRepo
   */
  validate(entity: Partial<Entity>): Promise<APIValidatorResponse<Entity>> {
    return this.api.post<APIValidatorResponse<Entity>>(
      {
        path: `${this.resourceName}/validate`,
        body: entity,
      },
    );
  }

  /**
   * Create single record
   *
   * @param {Entity} entity
   * @returns {Promise<Partial<Entity>>}
   * @memberof CrudAPIRepo
   */
  async create(entity: Partial<Entity>): Promise<Entity> {
    return (
      await this.api.post<{data: Entity}>(
        {
          path: this.resourceName,
          body: nestedPropPick('id', entity),
        },
      )
    )?.data;
  }

  /**
   * Update single item or bunch of them
   *
   * @param {CanBeArray<Partial<Entity>>} entity
   * @returns {Promise<CanBeArray<Entity>>}
   * @memberof CrudAPIRepo
   */
  update(entity: Partial<Entity>): Promise<Entity>;
  update(entity: Partial<Entity>[]): Promise<Entity[]>;
  async update(entity: CanBeArray<Partial<Entity>>): Promise<CanBeArray<Entity>> {
    if (entity instanceof Array) {
      return this.api.patch<Entity[]>(
        {
          path: `${this.resourceName}/items`,
          body: <Entity[]> entity.map(
            (item) => nestedPropPick('id', item),
          ),
        },
      );
    }

    return (
      await this.api.patch<{data: Entity}>(
        {
          path: `${this.resourceName}/${entity.id}`,
          body: nestedPropPick('id', entity),
        },
      )
    )?.data;
  }

  /**
   * Update bunch of items with the same value
   *
   * @param {APIBulkTarget<EntityPaginationFilters>} target
   * @param {Partial<Entity>} item
   * @returns {Promise<void>}
   * @memberof CrudAPIRepo
   */
  async updateBulk(
    target: APIBulkTarget<EntityPaginationFilters>,
    item: Partial<Entity>,
  ): Promise<void> {
    await this.api.patch<void>(
      {
        path: `${this.resourceName}/bulk`,
        body: {
          target,
          value: nestedPropPick('id', item),
        },
      },
    );
  }

  /**
   * Removes single record
   *
   * @param {ID} id
   * @returns {Promise<void>}
   * @memberof CrudAPIRepo
   */
  async delete(id: ID): Promise<void> {
    await this.api.delete<void>(
      {
        path: `${this.resourceName}/${id}`,
      },
    );
  }

  /**
   * Removes single or bunch of items
   *
   * @param {APIBulkTarget<EntityPaginationFilters>} target
   * @returns {Promise<void>}
   * @memberof CrudAPIRepo
   */
  async deleteBulk(target: APIBulkTarget<EntityPaginationFilters>): Promise<void> {
    await this.api.delete<void>(
      {
        path: `${this.resourceName}/bulk`,
        body: {
          target,
        },
      },
    );
  }

  /**
   * Finds single item
   *
   * @param {ID} id
   * @returns {Promise<Entity>}
   * @memberof CrudAPIRepo
   */
  findOne(id: ID): Promise<Entity> {
    return this.api.get<Entity>(
      {
        path: `${this.resourceName}/${id}`,
      },
    );
  }

  /**
   * Executes entity pagination
   *
   * @param {EntityPaginationFilters} filters
   * @returns {Promise<APIPagination<Entity>>}
   * @memberof CrudAPIRepo
   */
  findAll(filters?: EntityPaginationFilters): Promise<APIPagination<Entity>> {
    return this.api.get<APIPagination<Entity>>(
      {
        path: this.resourceName,
        urlParams: transformFiltersToPlainObj(
          nestedPropPick(
            'id',
            filters ?? {
              page: 1,
              limit: 50,
            },
            {
              whitelistKeys: this.filtersNestedPickWhitelist as string[],
            },
          ),
        ),
      },
    );
  }

  /**
   * Returns not paginated list of records
   *
   * @param {EntityPaginationFilters} [filters]
   * @returns {Promise<Entity[]>}
   * @memberof CrudAPIRepo
   */
  async findPlainList(filters?: EntityPaginationFilters): Promise<Entity[]> {
    const {items} = await this.api.get<APIPagination<Entity>>(
      {
        path: this.resourceName,
        urlParams: {
          ...transformFiltersToPlainObj(
            nestedPropPick(
              'id',
              filters ?? {
                page: 1,
                limit: 50,
              },
              {
                whitelistKeys: this.filtersNestedPickWhitelist as string[],
              },
            ),
          ),
          limit: 9999,
        },
      },
    );

    return items;
  }

  /**
   * Count all items
   *
   * @param {EntityPaginationFilters} filters
   * @returns {Promise<number>}
   * @memberof CrudAPIRepo
   */
  async count(filters?: EntityPaginationFilters): Promise<number> {
    const result = await this.api.get<CountResult>(
      {
        path: `${this.resourceName}/count`,
        urlParams: transformFiltersToPlainObj(
          nestedPropPick(
            'id',
            filters ?? {
              page: 1,
              limit: 50,
            },
            {
              whitelistKeys: this.filtersNestedPickWhitelist as string[],
            },
          ),
        ),
      },
    );

    return result?.count;
  }
}
