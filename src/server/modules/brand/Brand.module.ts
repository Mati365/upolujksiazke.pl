import {Module} from '@nestjs/common';

import {AttachmentModule} from '../attachment/Attachment.module';
import {BrandService} from './Brand.service';

@Module(
  {
    imports: [
      AttachmentModule,
    ],
    providers: [
      BrandService,
    ],
    exports: [
      BrandService,
    ],
  },
)
export class BrandModule {}
