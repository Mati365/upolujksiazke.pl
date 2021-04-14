import {Module} from '@nestjs/common';

import {RemoteModule} from '@server/modules/remote/Remote.module';
import {BookSummaryService} from './BookSummary.service';

@Module(
  {
    imports: [
      RemoteModule,
    ],
    providers: [
      BookSummaryService,
    ],
    exports: [
      BookSummaryService,
    ],
  },
)
export class BookSummaryModule {}
