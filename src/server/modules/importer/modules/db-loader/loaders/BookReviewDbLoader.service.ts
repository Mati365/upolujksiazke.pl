import {Injectable, Inject, forwardRef} from '@nestjs/common';

import {BookReviewerDto} from '@server/modules/book/modules/reviewer/dto/BookReviewer.dto';
import {BookReviewerService} from '@server/modules/book/modules/reviewer/BookReviewer.service';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {BookReviewAuthor, BookReviewScrapperInfo} from '../../scrapper/service/scrappers/BookReview.scrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {BookDbLoader} from './BookDbLoader.service';
import {RemoteEntityDto} from '../../scrapper/dto/RemoteEntity.dto';

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
    const {bookDbLoader} = this;
    const content = metadata.content as BookReviewScrapperInfo;
    const {websiteId} = metadata.remote;

    await Promise.all(
      [
        bookDbLoader.extractBookToDb(content),
        this.extractReviewerToDb(
          {
            author: content.author,
            websiteId,
          },
        ),
      ],
    );
  }

  /**
   * Finds or creates reviewer record in DB
   *
   * @param {Object} attrs
   * @returns
   * @memberof BookReviewDbLoader
   */
  async extractReviewerToDb(
    {
      author,
      websiteId,
    }: {
      author: BookReviewAuthor,
      websiteId: number,
    },
  ) {
    const {bookReviewerService} = this;
    const remoteId = author.id ?? author.name;

    return bookReviewerService.upsert(
      new BookReviewerDto(
        {
          name: author.name,
          gender: author.gender,
          remote: new RemoteEntityDto(
            {
              remoteId,
              websiteId,
            },
          ),
        },
      ),
    );
  }
}
