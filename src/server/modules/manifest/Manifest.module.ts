import {DynamicModule, Global, Module} from '@nestjs/common';
import {
  ManifestService,
  ManifestServiceOptions,
  MANIFEST_OPTIONS,
} from './Manifest.service';

@Global()
@Module({})
export class ManifestModule {
  static register(options: ManifestServiceOptions): DynamicModule {
    return {
      module: ManifestModule,
      providers: [
        {
          provide: MANIFEST_OPTIONS,
          useValue: options,
        },
        ManifestService,
      ],
      exports: [ManifestService],
    };
  }
}
