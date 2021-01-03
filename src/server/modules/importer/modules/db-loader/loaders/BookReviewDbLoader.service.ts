import {Injectable, Inject, forwardRef} from '@nestjs/common';

import {BookReviewerService} from '@server/modules/book/modules/reviewer/BookReviewer.service';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {BookDbLoader} from './BookDbLoader.service';

@Injectable()
export class BookReviewDbLoader implements MetadataDbLoader {
  constructor(
    private readonly bookDbLoader: BookDbLoader,

    @Inject(forwardRef(() => BookReviewerService))
    private readonly bookReviewerService: BookReviewerService,
  ) {}

  /**
   * @inheritdoc
   */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    console.info(metadata);

    await Promise.all(
      [],
    );
  }
}
