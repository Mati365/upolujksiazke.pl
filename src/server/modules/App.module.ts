import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {BullModule} from '@nestjs/bull';
import {EventEmitterModule} from '@nestjs/event-emitter';

import {SERVER_ENV} from '@server/constants/env';
import {isDevMode} from '@shared/helpers';

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
import {SentryModule} from './sentry';
import {RedisCacheModule} from './cache';
import {APIModule} from './api';
import {ElasticsearchConnectionModule} from './elasticsearch';

@Module(
  {
    imports: [
      DatabaseModule,
      EventEmitterModule.forRoot(),
      RedisCacheModule,
      ...(
        isCmdAppInstance()
          ? []
          : [
            ElasticsearchConnectionModule,
            BullModule.forRoot(
              {
                redis: SERVER_ENV.redisConfig,
                defaultJobOptions: {
                  removeOnComplete: true,
                  removeOnFail: true,
                },
              },
            ),
            APIModule,
            FrontModule,
            ManifestModule.forRoot(
              {
                file: 'public/files-manifest.json',
              },
            ),
            ...(
              isRootClusterAppInstance()
                ? [ScheduleModule.forRoot()]
                : []
            ),
          ]
      ),
      SentryModule.forRoot(
        isDevMode() || isCmdAppInstance()
          ? {}
          : SERVER_ENV.sentry,
      ),
      AttachmentModule.forRoot(
        {
          dest: SERVER_ENV.cdn.localPath,
        },
      ),
      TmpDirModule.forRoot(
        {
          rootPath: `tmp/bookmeter-instance-${getClusterAppInstance()}`,
        },
      ),
      RemoteModule,
      ImporterModule,
    ],
  },
)
export class AppModule {}
