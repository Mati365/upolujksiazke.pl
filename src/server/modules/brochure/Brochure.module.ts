import {Module} from '@nestjs/common';
import {BrochurePageModule} from './modules';
import {BrochureService} from './services/Brochure.service';

@Module(
  {
    imports: [
      BrochurePageModule,
    ],
    providers: [
      BrochureService,
    ],
    exports: [
      BrochureService,
      BrochurePageModule,
    ],
  },
)
export class BrochureModule {}
