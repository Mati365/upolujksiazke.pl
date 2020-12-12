import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';

import {ScrapperController} from './Scrapper.controller';
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
    controllers: [
      ScrapperController,
    ],
    providers: [
      ScrapperService,
    ],
  },
)
export class ScrapperModule {}
