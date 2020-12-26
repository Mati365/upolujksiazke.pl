import path from 'path';
import {Inject, Injectable, Scope} from '@nestjs/common';

import {loadFsJSON} from '@server/common/helpers/loadFsJSON';
import {isDevMode} from '@shared/helpers';

import {MANIFEST_OPTIONS} from './Manifest.module';

export type ManifestServiceOptions = {
  file: string,
};

@Injectable(
  {
    scope: (
      isDevMode()
        ? Scope.REQUEST
        : Scope.DEFAULT
    ),
  },
)
export class ManifestService {
  private readonly manifest: object;

  constructor(
    @Inject(MANIFEST_OPTIONS) readonly options: ManifestServiceOptions,
  ) {
    this.manifest = loadFsJSON(
      path.resolve(__dirname, options.file),
    );
  }

  get files() {
    return this.manifest;
  }
}
