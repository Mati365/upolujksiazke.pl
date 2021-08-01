import {Module} from '@nestjs/common';
import {BrochurePageService} from './BrochurePage.service';

@Module(
  {
    providers: [
      BrochurePageService,
    ],
    exports: [
      BrochurePageService,
    ],
  },
)
export class BrochurePageModule {}
