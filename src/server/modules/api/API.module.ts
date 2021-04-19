import {Global, Module, forwardRef} from '@nestjs/common';
import {BookModule} from '../book/Book.module';
import {RedisCacheModule} from '../cache';
import {TagModule} from '../tag';
import {APIClientService} from './services';

@Global()
@Module(
  {
    imports: [
      forwardRef(() => RedisCacheModule),
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
