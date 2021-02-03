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
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {bookDbLoader} = this;
    const content = plainToClass(CreateBookReviewDto, metadata.content);

    await bookDbLoader.extractBookToDb(
      {
        book: content.book,
      },
    );
  }
}
