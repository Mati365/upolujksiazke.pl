import {Module} from '@nestjs/common';
import {
  RemoteWebsiteService,
  RemoteArticleService,
} from './service';

@Module(
  {
    providers: [
      RemoteWebsiteService,
      RemoteArticleService,
    ],
    exports: [
      RemoteWebsiteService,
      RemoteArticleService,
    ],
  },
)
export class RemoteModule {}
