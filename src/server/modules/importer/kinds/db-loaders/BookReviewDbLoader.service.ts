import {Injectable, Logger} from '@nestjs/common';
import {plainToClass} from 'class-transformer';

import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataEntity} from '@scrapper/entity';

import {MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';
import {BookDbLoaderService} from './BookDbLoader.service';

@Injectable()
export class BookReviewDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(BookReviewDbLoaderService.name);

  constructor(
    private readonly bookDbLoader: BookDbLoaderService,
  ) {}

  /**
   * @todo
   *  Change it! Remove searchAndExtractToDb!
   *
   * @inheritdoc
   */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {bookDbLoader, logger} = this;

    const review = plainToClass(CreateBookReviewDto, metadata.content);
    const book = await bookDbLoader.searchAndExtractToDb(
      {
        book: review.book,
      },
    );

    if (!book) {
      logger.warn(`Unable to match review book with title "${review.book.title}"!`);
      return;
    }

    console.info(book);
  }
}
