import {Module} from '@nestjs/common';

import {TagModule} from '../tag/Tag.module';
import {BrandModule} from '../brand/Brand.module';
import {BrochurePageModule} from './modules';

import {EsBrochureIndex} from './indices/EsBrochure.index';
import {
  BrochureService,
  BrochureTagsService,
  CardBrochureSearchService,
  EsCardBrochureSearchService,
} from './services';

@Module(
  {
    imports: [
      TagModule,
      BrandModule,
      BrochurePageModule,
    ],
    providers: [
      BrochureService,
      BrochureTagsService,
      CardBrochureSearchService,
      EsCardBrochureSearchService,
      EsBrochureIndex,
    ],
    exports: [
      BrochureService,
      BrochurePageModule,
      BrochureTagsService,
      CardBrochureSearchService,
      EsBrochureIndex,
    ],
  },
)
export class BrochureModule {}
