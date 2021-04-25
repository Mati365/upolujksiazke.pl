import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

import {BookImportedEvent} from '../events/BookImported.event';
import {BookSummaryDbLoaderService} from '../BookSummary.loader';

@Injectable()
export class EntityImportedListener {
  constructor(
    private bookSummaryService: BookSummaryDbLoaderService,
  ) {}

  @OnEvent('loader.book.imported')
  async handleImportedEvent({dto, book}: BookImportedEvent) {
    await this.bookSummaryService.searchAndExtractToDb(
      new CreateBookSummaryDto(
        {
          book: new CreateBookDto(
            {
              id: book.id,
              ...dto,
            },
          ),
        },
      ),
    );
  }
}
