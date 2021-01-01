import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {BullModule} from '@nestjs/bull';

import {SERVER_ENV} from '@server/constants/env';

import {
  getClusterAppInstance,
  isRootClusterAppInstance,
} from '../common/helpers';

import {DatabaseModule} from './database/Database.module';
import {FrontModule} from './front';
import {ManifestModule} from './manifest';
import {AttachmentModule} from './attachment';
import {ImporterModule} from './importer';
import {TmpDirModule} from './tmp-dir';

@Module(
  {
    imports: [
      DatabaseModule,
      BullModule.forRoot(
        {
          redis: SERVER_ENV.redisConfig,
          limiter: {
            max: 5,
            duration: 1500,
          },
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: true,
          },
        },
      ),
      ...(
        isRootClusterAppInstance()
          ? [ScheduleModule.forRoot()]
          : []
      ),
      AttachmentModule.register(),
      ManifestModule.register(
        {
          file: 'public/files-manifest.json',
        },
      ),
      TmpDirModule.register(
        {
          rootPath: `tmp/bookmeter-instance-${getClusterAppInstance()}`,
          preserveContentOnExit: true,
        },
      ),
      FrontModule,
      ImporterModule,
    ],
  },
)
export class AppModule {}
