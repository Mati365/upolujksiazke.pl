import {Injectable} from '@nestjs/common';

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
}
