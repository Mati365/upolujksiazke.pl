import {DynamicModule, Global, Module} from '@nestjs/common';
import {
  SENTRY_OPTIONS,
  SentryServiceOptions,
  SentryService,
} from './Sentry.service';

@Global()
@Module({})
export class SentryModule {
  static forRoot(options: SentryServiceOptions): DynamicModule {
    return {
      module: SentryModule,
      providers: [
        {
          provide: SENTRY_OPTIONS,
          useValue: options,
        },
        SentryService,
      ],
      exports: [SentryService],
    };
  }
}
