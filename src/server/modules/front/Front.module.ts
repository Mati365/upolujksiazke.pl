import useragent from 'express-useragent';
import {MiddlewareConsumer, Module} from '@nestjs/common';
import {APP_FILTER} from '@nestjs/core';

import {PAGE_I18N} from '@client/i18n/packs';

import {ServerExceptionFilter} from '@server/common/filters/ServerException.filter';
import {FrontController} from './Front.controller';
import {I18nModule} from '../i18n';
import {SitemapModule} from './modules';

@Module(
  {
    imports: [
      SitemapModule,
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
