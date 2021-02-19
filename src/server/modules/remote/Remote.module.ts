import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {RemoteWebsiteEntity} from './entity/RemoteWebsite.entity';
import {RemoteWebsiteService} from './service/RemoteWebsite.service';

@Module(
  {
    imports: [
      TypeOrmModule.forFeature([RemoteWebsiteEntity]),
    ],
    providers: [
      RemoteWebsiteService,
    ],
    exports: [
      RemoteWebsiteService,
    ],
  },
)
export class RemoteModule {}
