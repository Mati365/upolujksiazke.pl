import {Module} from '@nestjs/common';

import {ScrapperModule} from '@scrapper/Scrapper.module';
import {BookReviewerService} from './BookReviewer.service';

@Module(
  {
    imports: [
      ScrapperModule,
    ],
    providers: [
      BookReviewerService,
    ],
    exports: [
      BookReviewerService,
    ],
  },
)
export class BookReviewerModule {}
