import {Module} from '@nestjs/common';

import {DatabaseModule} from './database/Database.module';
import {FrontModule} from './front';
import {ManifestModule} from './manifest';
import {ScrapperModule} from './scrapper/Scrapper.module';

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
      ScrapperModule,
    ],
    controllers: [],
    providers: [],
  },
)
export class AppModule {}
