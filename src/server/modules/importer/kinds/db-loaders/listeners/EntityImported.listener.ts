import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {isDevMode} from '@shared/helpers';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';

import {BookImportedEvent} from '../events/BookImported.event';
import {BookSummaryDbLoaderService} from '../BookSummary.loader';
import {BookReviewImportedEvent} from '../events';

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

  @OnEvent('loader.review.imported')
  async handleImportedReviewEvent({dto, review}: BookReviewImportedEvent) {
    if (!isDevMode())
      return;

    await this.bookSummaryService.searchAndExtractToDb(
      new CreateBookSummaryDto(
        {
          book: new CreateBookDto(
            {
              id: review.bookId,
              ...dto.book,
            },
          ),
        },
      ),
    );
  }
}
