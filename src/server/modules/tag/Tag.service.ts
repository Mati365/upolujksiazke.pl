import * as R from 'ramda';
import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
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
        primaryKey: 'name',
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
