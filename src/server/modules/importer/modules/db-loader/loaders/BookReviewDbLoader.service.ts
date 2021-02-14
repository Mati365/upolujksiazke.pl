import {Injectable} from '@nestjs/common';
import {plainToClass} from 'class-transformer';

import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {BookDbLoaderService} from './BookDbLoader.service';

@Injectable()
export class BookReviewDbLoaderService implements MetadataDbLoader {
  constructor(
    private readonly bookDbLoader: BookDbLoaderService,
  ) {}

  /**
   * @todo
   *  Change it! Remove matchAndExtractToDb!
   *
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
