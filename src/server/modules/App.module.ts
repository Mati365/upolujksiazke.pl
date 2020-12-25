import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';

import {DatabaseModule} from './database/Database.module';
import {FrontModule} from './front';
import {ManifestModule} from './manifest';
import {ImporterModule} from './importer';

@Module(
  {
    imports: [
      DatabaseModule,
      ...(
        +process.env.NODE_APP_INSTANCE === 0
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
    controllers: [],
    providers: [],
  },
)
export class AppModule {}
