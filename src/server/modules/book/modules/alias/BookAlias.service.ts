import {Injectable} from '@nestjs/common';
import {In} from 'typeorm';
import * as R from 'ramda';

import {BookAliasEntity} from './BookAlias.entity';
import {CreateBookAliasDto} from './dto/CreateBookAlias.dto';

@Injectable()
export class BookAliasService {
  /**
   * Create single book alias
   *
   * @param {CreateBookAliasDto} dto
   * @returns {Promise<BookAliasEntity>}
   * @memberof BookAliasService
   */
  create(dto: CreateBookAliasDto): Promise<BookAliasEntity> {
    return BookAliasEntity.save(
      BookAliasEntity.create(dto),
    );
  }

  /**
   * Gen provided slugs redirects list
   *
   * @param {string[]} slugs
   * @returns
   * @memberof BookAliasService
   */
  async getSlugsAliases(slugs: string[]): Promise<Record<string, string>> {
    const aliases = await BookAliasEntity.find(
      {
        select: ['srcSlug', 'destSlug'],
        where: {
          srcSlug: In(R.uniq(slugs)),
        },
      },
    );

    return R.mapObjIndexed(
      ({destSlug}) => destSlug,
      R.groupBy(R.prop('srcSlug'), aliases),
    );
  }

  /**
   * Returns of array slugs
   *
   * @param {string[]} slugs
   * @returns
   * @memberof BookAliasService
   */
  async replaceRedirected(slugs: string[]) {
    const redirects = await this.getSlugsAliases(slugs);

    return [
      ...R.without(R.keys(redirects), slugs),
      ...R.values(redirects),
    ];
  }
}
