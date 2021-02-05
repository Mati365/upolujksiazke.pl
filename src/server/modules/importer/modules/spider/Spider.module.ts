import {Module} from '@nestjs/common';

import {ScrapperModule} from '@scrapper/Scrapper.module';
import {SpiderService} from './service/Spider.service';

@Module(
  {
    imports: [
      ScrapperModule,
    ],
    providers: [
      SpiderService,
    ],
    exports: [
      SpiderService,
    ],
  },
)
export class SpiderModule {}
