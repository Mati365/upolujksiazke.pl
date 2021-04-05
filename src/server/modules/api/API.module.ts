import {Global, Module} from '@nestjs/common';
import {BookModule} from '../book/Book.module';
import {RedisCacheModule} from '../cache';
import {TagModule} from '../tag';
import {APIClientService} from './services';

@Global()
@Module(
  {
    imports: [
      RedisCacheModule,
      TagModule,
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
