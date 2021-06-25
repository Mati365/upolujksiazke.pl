import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {BookSummaryEntity} from '@server/modules/book/modules/summary/entity';

export class BookSummaryImportedEvent {
  constructor(
    public readonly review: BookSummaryEntity,
    public readonly dto: CreateBookSummaryDto,
  ) {}
}
