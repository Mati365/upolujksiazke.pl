import {APP_INTERCEPTOR} from '@nestjs/core';

import {DynamicModule, Module} from '@nestjs/common';
import {I18nPackService, I18nPackServiceOptions} from './I18nPack.service';
import {I18nReqInterceptor} from './I18nReq.interceptor';

@Module({})
export class I18nModule {
  static register(options: I18nPackServiceOptions): DynamicModule {
    return {
      module: I18nModule,
      providers: [
        {
          provide: 'I18N_OPTIONS',
          useValue: options,
        },
        I18nPackService,
        {
          provide: APP_INTERCEPTOR,
          useClass: I18nReqInterceptor,
        },
      ],
      exports: [
        I18nPackService,
      ],
    };
  }
}
