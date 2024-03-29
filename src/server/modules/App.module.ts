import {APP_GUARD} from '@nestjs/core';
import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {BullModule} from '@nestjs/bull';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';

import {SERVER_ENV} from '@server/constants/env';

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
import {RedisCacheModule} from './cache';
import {APIModule} from './api';
import {ElasticsearchConnectionModule} from './elasticsearch';
import {FrontModule} from './front';
import {TrackerModule} from './tracker';
import {ReactionsModule} from './reactions';
import {UserModule} from './user';
import {SitemapModule} from './sitemap';
import {NopModule} from './nop';
import {BookModule} from './book';
import {BrandModule} from './brand';
import {IntegrationsModule} from './integrations';
import {RecommendationModule} from './recommendation';

@Module(
  {
    imports: [
      DatabaseModule,
      EventEmitterModule.forRoot(),
      SitemapModule.register(SERVER_ENV.sitemap),
      NopModule,
      RedisCacheModule,
      APIModule,
      FrontModule,
      IntegrationsModule,
      RecommendationModule,
      ElasticsearchConnectionModule,
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
          limit: 130,
          ignoreUserAgents: [
            /googlebot/gi,
            /bingbot/gi,
          ],
        },
      ),
      UserModule,
      ReactionsModule,
      TrackerModule,
      BrandModule,
      BookModule,
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
