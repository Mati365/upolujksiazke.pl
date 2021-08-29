import {Global, Module, forwardRef} from '@nestjs/common';
import {RouterModule} from 'nest-router';

import {isCmdAppInstance} from '@server/common/helpers/isCmdAppInstance';

import {BookModule} from '../book/Book.module';
import {BrandModule} from '../brand/Brand.module';
import {RedisCacheModule} from '../cache';
import {TagModule} from '../tag';
import {APIv1Module} from './controllers/v1/APIv1.module';
import {RefreshJWTCookieInterceptor} from './interceptors/RefreshJWTCookie.interceptor';
import {APIClientService} from './services';
import {BrochureModule} from '../brochure';

@Global()
@Module(
  {
    imports: [
      TagModule,
      BrandModule,
      BrochureModule,
      BookModule,
      ...(
        isCmdAppInstance()
          ? []
          : [
            forwardRef(() => RedisCacheModule),
            APIv1Module,
            RouterModule.forRoutes(
              [
                {
                  path: '/api',
                  children: [
                    {
                      path: '/v1',
                      module: APIv1Module,
                    },
                  ],
                },
              ],
            ),
          ]
      ),
    ],
    providers: [
      RefreshJWTCookieInterceptor,
      APIClientService,
    ],
    exports: [
      RefreshJWTCookieInterceptor,
      APIClientService,
    ],
  },
)
export class APIModule {}
