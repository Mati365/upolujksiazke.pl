import path from 'path';
import {Inject, Injectable, Scope} from '@nestjs/common';

import {loadFsJSON} from '@server/common/helpers/loadFsJSON';
import {isDevMode} from '@shared/helpers';

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
    @Inject('MANIFEST_OPTIONS') private options: ManifestServiceOptions,
  ) {
    this.manifest = loadFsJSON(
      path.resolve(__dirname, options.file),
    );
  }

  get files() {
    return this.manifest;
  }
}
