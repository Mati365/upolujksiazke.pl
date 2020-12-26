import {DynamicModule, Global, Module} from '@nestjs/common';
import {
  CdnService,
  CdnServiceOptions,
  CDN_OPTIONS,
} from './Cdn.service';

@Global()
@Module({})
export class CdnModule {
  static register(options: CdnServiceOptions): DynamicModule {
    return {
      module: CdnModule,
      providers: [
        {
          provide: CDN_OPTIONS,
          useValue: options,
        },
        CdnService,
      ],
      exports: [CdnService],
    };
  }
}
