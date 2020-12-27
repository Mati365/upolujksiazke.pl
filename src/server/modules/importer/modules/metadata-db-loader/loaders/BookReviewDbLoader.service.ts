import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/postgresql';
import {Injectable} from '@nestjs/common';

import {findOrCreateBy} from '@server/common/helpers/db';

import {BookReviewerEntity} from '@server/modules/book-reviewer/BookReviewer.entity';
import {ScrapperRemoteEntity} from '../../scrapper/embeddables/ScrapperRemoteEntity.embeddable';
import {ScrapperMetadataEntity, ScrapperWebsiteEntity} from '../../scrapper/entity';

import {BookReviewAuthor, BookReviewScrapperInfo} from '../../scrapper/service/scrappers/BookReviewScrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class BookReviewDbLoader implements MetadataDbLoader {
  constructor(
    @InjectRepository(BookReviewerEntity)
    private readonly bookReviewerRepository: EntityRepository<BookReviewerEntity>,
  ) {}

  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const content = metadata.content as BookReviewScrapperInfo;
    const {website} = metadata;

    const [authorEntity] = await Promise.all(
      [
        this.extractReviewerToDb(
          {
            author: content.author,
            website,
          },
        ),

        this.extractBookToDb(),
      ],
    );

    console.info(authorEntity.id, authorEntity.remoteEntity);
  }

  /**
   * Finds or creates reviewer record in DB
   *
   * @private
   * @param {Object} attrs
   * @returns
   * @memberof BookReviewDbLoader
   */
  private extractReviewerToDb(
    {
      author,
      website,
    }: {
      author: BookReviewAuthor,
      website: ScrapperWebsiteEntity,
    },
  ) {
    const {bookReviewerRepository} = this;
    const id = author.id ?? author.name;

    return findOrCreateBy(
      {
        repository: bookReviewerRepository,
        data: new BookReviewerEntity(
          {
            gender: author.gender,
            name: author.name,
            remoteEntity: new ScrapperRemoteEntity(
              {
                id,
                website: website.id as any, // fixme: using plain website cases mem leak
              },
            ),
          },
        ),
        where: {
          remoteEntity: {
            id,
          },
        },
      },
    );
  }

  /**
   * Finds or creates book record in db
   *
   * @private
   * @returns
   * @memberof BookReviewDbLoader
   */
  private extractBookToDb() {
    return null;
  }
}
