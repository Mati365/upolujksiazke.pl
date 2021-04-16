import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {isDevMode} from '@shared/helpers';

import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {BookImportedEvent} from '../events/BookImported.event';
import {BookSummaryDbLoaderService} from '../BookSummary.loader';
import {BookReviewImportedEvent} from '../events';

@Injectable()
export class EntityImportedListener {
  constructor(
    private bookSummaryService: BookSummaryDbLoaderService,
  ) {}

  @OnEvent('loader.book.imported')
  async handleImportedEvent({dto}: BookImportedEvent) {
    await this.bookSummaryService.searchAndExtractToDb(
      new CreateBookSummaryDto(
        {
          book: dto,
        },
      ),
    );
  }

  @OnEvent('loader.review.imported')
  async handleImportedReviewEvent({dto}: BookReviewImportedEvent) {
    if (!isDevMode())
      return;

    await this.bookSummaryService.searchAndExtractToDb(
      new CreateBookSummaryDto(
        {
          book: dto.book,
        },
      ),
    );
  }
}
