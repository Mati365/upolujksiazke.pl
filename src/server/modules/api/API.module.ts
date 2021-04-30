import {Global, Module, forwardRef} from '@nestjs/common';
import {RouterModule} from 'nest-router';

import {BookModule} from '../book/Book.module';
import {RedisCacheModule} from '../cache';
import {TagModule} from '../tag';
import {APIv1Module} from './controllers/v1/APIv1.module';
import {APIClientService} from './services';

@Global()
@Module(
  {
    imports: [
      TagModule,
      BookModule,
      APIv1Module,
      forwardRef(() => RedisCacheModule),
      RouterModule.forRoutes(
        [
          {
            path: '/api',
            childrens: [
              {
                path: '/v1',
                module: APIv1Module,
              },
            ],
          },
        ],
      ),
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
