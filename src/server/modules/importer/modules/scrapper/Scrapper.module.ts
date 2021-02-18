import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {BookEntity} from '@server/modules/book/Book.entity';
import {BookReviewEntity} from '@server/modules/book/modules/review/BookReview.entity';
import {MetadataDbLoaderModule} from '../db-loader/MetadataDbLoader.module';

import {ScrapperMetadataEntity} from './entity';
import {
  WebsiteInfoScrapperService,
  ScrapperCronService,
  ScrapperService,
  ScrapperMetadataService,
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
      ScrapperMetadataService,
      ScrapperRefreshService,
      ScrapperReanalyzerService,
      ScrapperMatcherService,
    ],
    exports: [
      WebsiteInfoScrapperService,
      ScrapperService,
      ScrapperMetadataService,
      ScrapperRefreshService,
      ScrapperReanalyzerService,
      ScrapperMatcherService,
    ],
  },
)
export class ScrapperModule {}
