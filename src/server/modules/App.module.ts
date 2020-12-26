import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {BullModule} from '@nestjs/bull';

import {ENV} from '@server/constants/env';

import {isRootClusterAppInstance} from '../common/helpers';

import {DatabaseModule} from './database/Database.module';
import {FrontModule} from './front';
import {ManifestModule} from './manifest';
import {CdnModule} from './cdn';
import {ImporterModule} from './importer';

@Module(
  {
    imports: [
      DatabaseModule,
      BullModule.forRoot(
        {
          redis: ENV.server.redisConfig,
        },
      ),
      ...(
        isRootClusterAppInstance()
          ? [ScheduleModule.forRoot()]
          : []
      ),
      CdnModule.register(
        {
          uploadRootDir: ENV.server.cdn.localPath,
        },
      ),
      ManifestModule.register(
        {
          file: 'public/files-manifest.json',
        },
      ),
      FrontModule,
      ImporterModule,
    ],
  },
)
export class AppModule {}
