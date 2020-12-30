import {DynamicModule, Global, Module} from '@nestjs/common';
import uuid from 'uuid';

import {
  TmpDirService,
  TmpDirServiceOptions,
  TMP_DIR_OPTIONS,
} from './TmpDir.service';

export const DEFAULT_TMP_DIR_OPTIONS: Readonly<Partial<TmpDirServiceOptions>> = Object.freeze(
  {
    childUuidFn: () => uuid.v4(),
  },
);

@Global()
@Module({})
export class TmpDirModule {
  static register(options: TmpDirServiceOptions): DynamicModule {
    return {
      module: TmpDirModule,
      providers: [
        {
          provide: TMP_DIR_OPTIONS,
          useValue: {
            ...DEFAULT_TMP_DIR_OPTIONS,
            ...options,
          },
        },
        TmpDirService,
      ],
      exports: [TmpDirService],
    };
  }
}
