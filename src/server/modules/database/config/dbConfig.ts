import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import * as R from 'ramda';

import {SERVER_ENV} from '@server/constants/env';
import {isDevMode} from '@shared/helpers';

import {TagEntity} from '@server/modules/tag/Tag.entity';

import {ScrapperMetadataEntity} from '../../importer/modules/scrapper/entity';
import {SpiderQueueEntity} from '../../importer/modules/spider/entity/SpiderQueue.entity';
import {
  RemoteWebsiteEntity,
  RemoteArticleEntity,
} from '../../remote/entity';

import {
  ImageAttachmentEntity,
  AttachmentEntity,
} from '../../attachment/entity';

import {BookEntity, SchoolBookEntity} from '../../book/entity';
import {BookAuthorEntity} from '../../book/modules/author/BookAuthor.entity';
import {BookReviewEntity} from '../../book/modules/review/BookReview.entity';
import {BookCategoryEntity} from '../../book/modules/category/BookCategory.entity';
import {BookReviewerEntity} from '../../book/modules/reviewer/BookReviewer.entity';
import {BookReleaseEntity} from '../../book/modules/release/BookRelease.entity';
import {BookPublisherEntity} from '../../book/modules/publisher/BookPublisher.entity';
import {BookAvailabilityEntity} from '../../book/modules/availability/BookAvailability.entity';
import {BookVolumeEntity} from '../../book/modules/volume/BookVolume.entity';
import {BookKindEntity} from '../../book/modules/kind/BookKind.entity';
import {BookPrizeEntity} from '../../book/modules/prize/BookPrize.entity';
import {BookSeriesEntity} from '../../book/modules/series/BookSeries.entity';
import {BookEraEntity} from '../../book/modules/era/BookEra.entity';
import {BookGenreEntity} from '../../book/modules/genre/BookGenre.entity';

export const DB_ENTITIES = {
  RemoteWebsiteEntity,
  RemoteArticleEntity,
  ImageAttachmentEntity,
  AttachmentEntity,
  BookAvailabilityEntity,
  BookPublisherEntity,
  BookReleaseEntity,
  BookAuthorEntity,
  BookEntity,
  BookReviewEntity,
  BookCategoryEntity,
  BookReviewerEntity,
  BookVolumeEntity,
  BookKindEntity,
  BookPrizeEntity,
  BookSeriesEntity,
  BookEraEntity,
  BookGenreEntity,
  SchoolBookEntity,
  ScrapperMetadataEntity,
  SpiderQueueEntity,
  TagEntity,
};

export const DB_CONFIG: TypeOrmModuleOptions = {
  ...SERVER_ENV.dbConfig,
  type: 'postgres',
  logger: 'advanced-console',
  logging: (
    isDevMode()
      ? 'all'
      : false
  ),
  synchronize: false,
  entities: R.values(DB_ENTITIES),
};
