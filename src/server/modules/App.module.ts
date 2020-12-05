import {Module} from '@nestjs/common';

import {FrontModule} from './front';
import {ManifestModule} from './manifest';

@Module(
  {
    imports: [
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
