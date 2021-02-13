import path from 'path';
import mkdirp from 'mkdirp';
import {Observable} from 'rxjs';
import {Inject, Injectable} from '@nestjs/common';

import {
  removeAndCreateDirAsync,
  removeAndCreateDirSync,
  removeDirIfExistsAsync,
  removeDirIfExistsSync,
} from '@server/common/helpers';

import {CanBePromise} from '@shared/types';

export const TMP_DIR_OPTIONS = '_TMP_DIR_OPTIONS';

export type TmpDirServiceOptions = {
  rootPath: string,
  preserveContentOnExit?: boolean,
  childUuidFn?: () => string,
};

export type TmpDirObservable<T extends Observable<any>> = T & {
  deleteTmpScope(): Promise<void>,
};

export type TmpFolderScopeAttrs = {
  tmpFolderPath: string,
  deleteScope(): Promise<void>,
};

export type TmpDirScopeExecutor<T = any> = (attrs: TmpFolderScopeAttrs) => CanBePromise<T>;

export type TmpDirScopeEnterAttrs<DeleteOnExit = boolean> = {
  withUUID?: boolean,
  name?: string,
  deleteOnExit: DeleteOnExit,
};

/**
 * Checks if returned subscriber has deleteScope
 *
 * @export
 * @template T
 * @param {T} obj
 * @returns {obj is TmpDirObservable<T>}
 */
export function isTmpScopeObservable<T extends Observable<any>>(obj: T): obj is TmpDirObservable<T> {
  return !!obj && 'deleteTmpScope' in obj;
}

/**
 * Service that creates Tmp folder for async functions
 *
 * @export
 * @class TmpDirService
 */
@Injectable()
export class TmpDirService {
  constructor(
    @Inject(TMP_DIR_OPTIONS) private readonly options: TmpDirServiceOptions,
  ) {}

  get preserveContentOnExit() {
    return this.options.preserveContentOnExit;
  }

  get rootPath() {
    return this.options.rootPath;
  }

  onModuleInit() {
    if (this.preserveContentOnExit)
      mkdirp.sync(this.rootPath);
    else
      removeAndCreateDirSync(this.rootPath);
  }

  onModuleDestroy() {
    if (!this.preserveContentOnExit)
      removeDirIfExistsSync(this.rootPath);
  }

  /**
   * Creates new folder in tmp dir and removes
   * it after promise resolve
   *
   * @template T
   * @param {(TmpDirScopeEnterAttrs & {deleteOnExit: true})} attrs
   * @param {TmpDirScopeExecutor<T>} fn
   * @returns {Promise<T>}
   * @memberof TmpDirService
   */
  async enterScope<T>(
    attrs: TmpDirScopeEnterAttrs & {deleteOnExit: true},
    fn: TmpDirScopeExecutor<T>,
  ): Promise<T>;

  async enterScope<T>(
    attrs: TmpDirScopeEnterAttrs & {deleteOnExit: false},
    fn: TmpDirScopeExecutor<T>,
  ): Promise<[T, VoidFunction]>;

  async enterScope<T>(
    {
      withUUID = true,
      name,
      deleteOnExit,
    }: TmpDirScopeEnterAttrs,
    fn: TmpDirScopeExecutor<T>,
  ): Promise<[T, VoidFunction] | T> {
    const {options} = this;
    const folderName = (
      [
        name,
        withUUID && options.childUuidFn(),
      ]
        .filter(Boolean)
        .join('-')
    );

    const fullPath = path.resolve(options.rootPath, folderName);
    const deleteScope = async () => {
      await removeDirIfExistsAsync(fullPath);
    };

    await removeAndCreateDirAsync(fullPath);

    const result = fn(
      {
        tmpFolderPath: fullPath,
        deleteScope,
      },
    );

    if (deleteOnExit) {
      const promiseResult = await result;
      if (promiseResult && promiseResult instanceof Observable)
        (promiseResult as TmpDirObservable<any>).deleteScope = deleteScope;
      else
        await deleteScope();
    }

    return result;
  }
}
