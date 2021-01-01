import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookEntity} from '@server/modules/book/Book.entity';
import {BookReviewEntity} from '@server/modules/book/modules/review/BookReview.entity';

import {MetadataDbLoaderModule} from '../db-loader/MetadataDbLoader.module';
import {
  WebsiteInfoScrapperService,
  ScrapperCronService,
  ScrapperService,
  RemoteEntityService,
} from './service';

import {
  ScrapperMetadataEntity,
  ScrapperWebsiteEntity,
} from './entity';

@Module(
  {
    imports: [
      forwardRef(() => MetadataDbLoaderModule),
      TypeOrmModule.forFeature(
        [
          BookEntity,
          BookReviewEntity,
          ScrapperWebsiteEntity,
          ScrapperMetadataEntity,
        ],
      ),
    ],
    providers: [
      WebsiteInfoScrapperService,
      ScrapperService,
      ScrapperCronService,
      RemoteEntityService,
    ],
    exports: [
      WebsiteInfoScrapperService,
      ScrapperService,
      RemoteEntityService,
    ],
  },
)
export class ScrapperModule {}
