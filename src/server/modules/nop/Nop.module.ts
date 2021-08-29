import {Global, Module} from '@nestjs/common';
import {NopService, NOP_SERVICE} from './Nop.service';

@Global()
@Module(
  {
    providers: [
      {
        provide: NOP_SERVICE,
        useClass: NopService,
      },
    ],
    exports: [
      {
        provide: NOP_SERVICE,
        useClass: NopService,
      },
    ],
  },
)
export class NopModule {}
