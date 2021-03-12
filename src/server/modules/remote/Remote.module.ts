import {Module} from '@nestjs/common';
import {RemoteWebsiteService} from './service/RemoteWebsite.service';

@Module(
  {
    providers: [
      RemoteWebsiteService,
    ],
    exports: [
      RemoteWebsiteService,
    ],
  },
)
export class RemoteModule {}
