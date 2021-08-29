import {BookEntity} from '@server/modules/book/entity/Book.entity';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

export class BookImportedEvent {
  constructor(
    public readonly book: BookEntity,
    public readonly dto: CreateBookDto,
  ) {}
}
