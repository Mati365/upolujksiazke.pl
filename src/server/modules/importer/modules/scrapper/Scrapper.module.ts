import {Module, forwardRef} from '@nestjs/common';

import {RemoteModule} from '@server/modules/remote/Remote.module';
import {MetadataDbLoaderModule} from '../db-loader/MetadataDbLoader.module';

import {
  WebsiteInfoScrapperService,
  ScrapperCronService,
  ScrapperService,
  ScrapperMetadataService,
  RemoteArticleScrapperService,
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
    ],
    providers: [
      WebsiteInfoScrapperService,
      RemoteArticleScrapperService,
      ScrapperService,
      ScrapperCronService,
      ScrapperMetadataService,
      ScrapperRefreshService,
      ScrapperReanalyzerService,
      ScrapperMatcherService,
    ],
    exports: [
      WebsiteInfoScrapperService,
      RemoteArticleScrapperService,
      ScrapperService,
      ScrapperMetadataService,
      ScrapperRefreshService,
      ScrapperReanalyzerService,
      ScrapperMatcherService,
    ],
  },
)
export class ScrapperModule {}
