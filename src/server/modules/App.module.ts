import {Module} from '@nestjs/common';

import {DatabaseModule} from './database/Database.module';
import {FrontModule} from './front';
import {ManifestModule} from './manifest';

@Module(
  {
    imports: [
      DatabaseModule,
      ManifestModule.register(
        {
          file: 'public/files-manifest.json',
        },
      ),
      FrontModule,
    ],
    controllers: [],
    providers: [],
  },
)
export class AppModule {}
