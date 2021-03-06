import {Global, Module} from '@nestjs/common';
import {APIClientService} from './services';

@Global()
@Module(
  {
    providers: [
      APIClientService,
    ],
    exports: [
      APIClientService,
    ],
  },
)
export class APIModule {}
