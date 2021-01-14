import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {RemoteModule} from '@server/modules/remote/Remote.module';
import {BookPublisherModule} from '../publisher';
import {BookVolumeModule} from '../volume';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookReleaseService} from './BookRelease.service';

@Module(
  {
    imports: [
      RemoteModule,
      BookPublisherModule,
      BookVolumeModule,
      TypeOrmModule.forFeature([BookReleaseEntity]),
    ],
    providers: [
      BookReleaseService,
    ],
    exports: [
      BookReleaseService,
    ],
  },
)
export class BookReleaseModule {}
