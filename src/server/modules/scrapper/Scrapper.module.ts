import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';

import {ScrapperService} from './service/Scrapper.service';
import {
  ScrapperMetadataEntity,
  ScrapperWebsiteEntity,
} from './entity';

@Module(
  {
    imports: [
      MikroOrmModule.forFeature(
        [
          ScrapperWebsiteEntity,
          ScrapperMetadataEntity,
        ],
      ),
    ],
    controllers: [],
    providers: [
      ScrapperService,
    ],
  },
)
export class ScrapperModule {}
