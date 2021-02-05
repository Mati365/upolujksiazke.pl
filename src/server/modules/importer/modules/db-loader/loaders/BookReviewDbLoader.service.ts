import {Injectable} from '@nestjs/common';
import {plainToClass} from 'class-transformer';

import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {BookDbLoader} from './BookDbLoader.service';

@Injectable()
export class BookReviewDbLoader implements MetadataDbLoader {
  constructor(
    private readonly bookDbLoader: BookDbLoader,
  ) {}

  /**
   * @inheritdoc
   */
  extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {bookDbLoader} = this;
    const review = plainToClass(CreateBookReviewDto, metadata.content);

    return bookDbLoader.matchAndExtractToDb(
      {
        book: review.book,
      },
    );
  }
}
