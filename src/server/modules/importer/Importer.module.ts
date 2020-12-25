import {Module} from '@nestjs/common';
import {ScrapperModule} from './modules/scrapper/Scrapper.module';

@Module(
  {
    imports: [
      ScrapperModule,
    ],
  },
)
export class ImporterModule {}
