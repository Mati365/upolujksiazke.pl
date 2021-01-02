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

import {
  ScrapperMatcherService,
  ScrapperReanalyzerService,
  ScrapperRefreshService,
} from './service/actions';

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
      ScrapperRefreshService,
      ScrapperReanalyzerService,
      ScrapperMatcherService,
    ],
    exports: [
      WebsiteInfoScrapperService,
      ScrapperService,
      ScrapperRefreshService,
      ScrapperReanalyzerService,
      ScrapperMatcherService,
    ],
  },
)
export class ScrapperModule {}
