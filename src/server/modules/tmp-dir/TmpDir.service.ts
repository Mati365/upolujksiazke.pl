import {Inject, Injectable} from '@nestjs/common';
import {
  removeAndCreateDirSync,
  removeDirIfExistsSync,
} from '@server/common/helpers';

export const TMP_DIR_OPTIONS = '_TMP_DIR_OPTIONS';

export type TmpDirServiceOptions = {
  rootPath: string,
  childUuidFn?: () => string,
};

@Injectable()
export class TmpDirService {
  constructor(
    @Inject(TMP_DIR_OPTIONS) private readonly options: TmpDirServiceOptions,
  ) {}

  onModuleInit() {
    removeAndCreateDirSync(this.rootPath);
  }

  onModuleDestroy() {
    removeDirIfExistsSync(this.rootPath);
  }

  get rootPath() {
    return this.options.rootPath;
  }
}
