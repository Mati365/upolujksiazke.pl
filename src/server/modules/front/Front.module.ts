import useragent from 'express-useragent';

import {APP_FILTER} from '@nestjs/core';
import {PAGE_I18N} from '@client/i18n/packs';

import {ServerExceptionFilter} from '@server/filters/ServerException.filter';
import {CacheModule, MiddlewareConsumer, Module} from '@nestjs/common';
import {FrontController} from './Front.controller';
import {I18nModule} from '../i18n';

@Module(
  {
    imports: [
      CacheModule.register(
        {
          noPromises: true,
        },
      ),
      I18nModule.register(
        {
          packs: PAGE_I18N,
        },
      ),
    ],
    controllers: [
      FrontController,
    ],
    providers: [
      {
        provide: APP_FILTER,
        useClass: ServerExceptionFilter,
      },
    ],
  },
)
export class FrontModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(useragent.express())
      .forRoutes('*');
  }
}
