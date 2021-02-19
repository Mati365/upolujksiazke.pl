import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {BullModule} from '@nestjs/bull';

import {SERVER_ENV} from '@server/constants/env';

import {
  getClusterAppInstance,
  isCmdAppInstance,
  isRootClusterAppInstance,
} from '../common/helpers';

import {DatabaseModule} from './database/Database.module';
import {RemoteModule} from './remote/Remote.module';
import {FrontModule} from './front';
import {ManifestModule} from './manifest';
import {AttachmentModule} from './attachment';
import {ImporterModule} from './importer';
import {TmpDirModule} from './tmp-dir';

@Module(
  {
    imports: [
      DatabaseModule,
      ...(
        isCmdAppInstance()
          ? []
          : [
            BullModule.forRoot(
              {
                redis: SERVER_ENV.redisConfig,
                defaultJobOptions: {
                  removeOnComplete: true,
                  removeOnFail: true,
                },
              },
            ),
          ]
      ),
      ...(
        isRootClusterAppInstance()
          ? [ScheduleModule.forRoot()]
          : []
      ),
      AttachmentModule.register(
        {
          dest: SERVER_ENV.cdn.localPath,
        },
      ),
      ManifestModule.register(
        {
          file: 'public/files-manifest.json',
        },
      ),
      TmpDirModule.register(
        {
          rootPath: `tmp/bookmeter-instance-${getClusterAppInstance()}`,
        },
      ),
      RemoteModule,
      FrontModule,
      ImporterModule,
    ],
  },
)
export class AppModule {}
