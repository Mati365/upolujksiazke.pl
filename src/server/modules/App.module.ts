import {APP_GUARD} from '@nestjs/core';
import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {BullModule} from '@nestjs/bull';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';

import {SERVER_ENV} from '@server/constants/env';
import {isDevMode} from '@shared/helpers';

import {
  getClusterAppInstance,
  isCmdAppInstance,
  isRootClusterAppInstance,
} from '../common/helpers';

import {DatabaseModule} from './database/Database.module';
import {RemoteModule} from './remote/Remote.module';
import {ManifestModule} from './manifest';
import {AttachmentModule} from './attachment';
import {ImporterModule} from './importer';
import {TmpDirModule} from './tmp-dir';
import {SentryModule} from './sentry';
import {RedisCacheModule} from './cache';
import {APIModule} from './api';
import {ElasticsearchConnectionModule} from './elasticsearch';
import {FrontModule} from './front';
import {TrackerModule} from './tracker';
import {ReactionsModule} from './reactions';
import {UserModule} from './user';

@Module(
  {
    imports: [
      DatabaseModule,
      EventEmitterModule.forRoot(),
      ...(
        isCmdAppInstance()
          ? []
          : [
            ElasticsearchConnectionModule,
            RedisCacheModule,
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
      ThrottlerModule.forRoot(
        {
          ttl: 60,
          limit: 25,
          ignoreUserAgents: [
            /googlebot/gi,
            /bingbot/gi,
          ],
        },
      ),
      UserModule,
      ReactionsModule,
      TrackerModule,
      RemoteModule,
      ImporterModule,
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
    ],
  },
)
export class AppModule {}
