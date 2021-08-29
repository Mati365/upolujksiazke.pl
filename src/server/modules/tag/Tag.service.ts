import * as R from 'ramda';
import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {ID} from '@shared/types';
import {
  PredefinedEntityDbIterator,
  IdMappedEntityDbIterator,
  createDbIteratedQuery,
  upsert,
} from '@server/common/helpers/db';

import {parameterize} from '@shared/helpers/parameterize';

import {TagEntity} from './Tag.entity';
import {CreateTagDto} from './dto/CreateTag.dto';

function isTagArray(arg: any): arg is CreateTagDto[] {
  return !arg || typeof arg[0] !== 'string';
}

@Injectable()
export class TagService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates iterator that walks over Tag table
   *
   * @template R
   * @param {PredefinedEntityDbIterator<TagEntity, R>} attrs
   * @memberof BookTagsService
   */
  createIteratedQuery<R>(attrs: PredefinedEntityDbIterator<TagEntity, R>) {
    return createDbIteratedQuery(
      {
        prefix: 't',
        query: (
          TagEntity.createQueryBuilder('t')
        ),
        ...attrs,
      },
    );
  }

  /**
   * Create query that iterates over all tags
   *
   * @param {IdMappedEntityDbIterator<TagEntity>} attrs
   * @memberof BookTagsService
   */
  createIdsIteratedQuery(attrs: IdMappedEntityDbIterator<TagEntity>) {
    return this.createIteratedQuery(
      {
        ...attrs,
        mapperFn: (result) => R.pluck('id', result),
      },
    );
  }

  /**
   * Finds one tag
   *
   * @param {ID} id
   * @return {Promise<TagEntity>}
   * @memberof TagService
   */
  findOne(id: ID): Promise<TagEntity> {
    return TagEntity.findOne(id);
  }

  /**
   * Creates single tag
   *
   * @param {CreateTagDto} dto
   * @returns {Promise<TagEntity>}
   * @memberof TagService
   */
  create(dto: CreateTagDto): Promise<TagEntity> {
    return TagEntity.save(
      TagEntity.create(dto),
    );
  }

  /**
   * Updates array of tags
   *
   * @param {((CreateTagDto | string)[])} names
   * @param {EntityManager} [entityManager]
   * @returns {Promise<TagEntity[]>}
   * @memberof TagService
   */
  async upsert(names: (CreateTagDto | string)[], entityManager?: EntityManager): Promise<TagEntity[]> {
    const {connection} = this;
    if (!names?.length)
      return [];

    const dtos = (
      isTagArray(names)
        ? names
        : names.map(
          (name: string) => new CreateTagDto(
            {
              name,
            },
          ),
        )
    );

    return upsert(
      {
        entityManager,
        connection,
        Entity: TagEntity,
        primaryKey: 'parameterizedName',
        data: (
          R
            .uniqBy(
              ({name}) => parameterize(name),
              R.reject((tag) => !tag?.name, dtos),
            )
            .map((dto) => new TagEntity(dto))
        ),
      },
    );
  }
}
