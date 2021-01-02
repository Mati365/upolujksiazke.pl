import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookEntity} from '@server/modules/book/Book.entity';
import {BookReviewEntity} from '@server/modules/book/modules/review/BookReview.entity';

import {RemoteModule} from '@server/modules/remote/Remote.module';
import {MetadataDbLoaderModule} from '../db-loader/MetadataDbLoader.module';

import {ScrapperMetadataEntity} from './entity';
import {
  WebsiteInfoScrapperService,
  ScrapperCronService,
  ScrapperService,
} from './service';

@Module(
  {
    imports: [
      forwardRef(() => MetadataDbLoaderModule),
      RemoteModule,
      TypeOrmModule.forFeature(
        [
          BookEntity,
          BookReviewEntity,
          ScrapperMetadataEntity,
        ],
      ),
    ],
    providers: [
      WebsiteInfoScrapperService,
      ScrapperService,
      ScrapperCronService,
    ],
    exports: [
      WebsiteInfoScrapperService,
      ScrapperService,
    ],
  },
)
export class ScrapperModule {}
