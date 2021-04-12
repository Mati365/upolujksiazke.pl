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
    ],
  },
)
export class RemoteModule {}
