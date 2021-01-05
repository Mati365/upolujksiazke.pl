import {Injectable, Inject, forwardRef} from '@nestjs/common';
import {plainToClass} from 'class-transformer';

import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {BookReviewerService} from '@server/modules/book/modules/reviewer/BookReviewer.service';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {BookDbLoader} from './BookDbLoader.service';

@Injectable()
export class BookReviewDbLoader implements MetadataDbLoader {
  constructor(
    private readonly bookDbLoader: BookDbLoader,
    private readonly bookReviewService: BookReviewerService,

    @Inject(forwardRef(() => BookReviewerService))
    private readonly bookReviewerService: BookReviewerService,
  ) {}

  /**
   * @inheritdoc
   */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {bookDbLoader} = this;
    const content = plainToClass(CreateBookReviewDto, metadata.content.dto);

    await bookDbLoader.extractBookToDb(
      {
        book: content.book,
      },
    );
  }
}
