import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';

import {isRootClusterAppInstance} from '../common/helpers';

import {DatabaseModule} from './database/Database.module';
import {FrontModule} from './front';
import {ManifestModule} from './manifest';
import {ImporterModule} from './importer';

@Module(
  {
    imports: [
      DatabaseModule,
      ...(
        isRootClusterAppInstance()
          ? [ScheduleModule.forRoot()]
          : []
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
