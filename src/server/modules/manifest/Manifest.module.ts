import {DynamicModule, Global, Module} from '@nestjs/common';
import {ManifestService, ManifestServiceOptions} from './Manifest.service';

export const MANIFEST_OPTIONS = 'MANIFEST_OPTIONS';

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
