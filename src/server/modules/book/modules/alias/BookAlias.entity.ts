import {Column, Entity} from 'typeorm';
import {DatedRecordEntity} from '@server/modules/database/DatedRecord.entity';

/**
 * Redirects one book to other
 *
 * @export
 * @class BookAliasEntity
 */
@Entity(
  {
    name: 'book_alias',
  },
)
export class BookAliasEntity extends DatedRecordEntity {
  @Column(
    {
      type: 'text',
      unique: true,
    },
  )
  srcSlug: string;

  @Column('text')
  destSlug: string;

  constructor(partial: Partial<BookAliasEntity>) {
    super();
    Object.assign(this, partial);
  }
}
