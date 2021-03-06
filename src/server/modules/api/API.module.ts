import {Global, Module} from '@nestjs/common';
import {BookModule} from '../book/Book.module';
import {APIClientService} from './services';

@Global()
@Module(
  {
    imports: [
      BookModule,
    ],
    providers: [
      APIClientService,
    ],
    exports: [
      APIClientService,
    ],
  },
)
export class APIModule {}
