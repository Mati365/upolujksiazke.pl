import {WrapMethod} from '@shared/helpers/decorators/WrapMethod';
import {
  TmpDirScopeEnterAttrs,
  TmpDirService,
} from '../TmpDir.service';

export type TmpFolderScopeAttrs = {
  tmpFolderPath: string,
};

type EnterTmpFolderScopeConfig = {
  dirService: TmpDirService,
  attrs: TmpDirScopeEnterAttrs<false>,
};

/**
 * Wraps function and provides them tmpFolder utils
 *
 * @export
 * @param {() => EnterTmpFolderScopeConfig} configFn
 * @returns
 */
export function EnterTmpFolderScope(configFn: () => EnterTmpFolderScopeConfig) {
  const innerWrapper = function innerWrapper(wrappedFn: Function) {
    let cachedConfig: EnterTmpFolderScopeConfig = null;

    return async function tmpFolderWrapper(...args: any[]) {
      const {dirService, attrs}: EnterTmpFolderScopeConfig = (
        // eslint-disable-next-line no-multi-assign
        cachedConfig ??= configFn.bind(this)()
      );

      return dirService.enterScope(
        attrs,
        ({tmpFolderPath}) => wrappedFn(
          ...args,
          {
            tmpFolderPath,
          } as TmpFolderScopeAttrs,
        ),
      );
    };
  };

  return WrapMethod(innerWrapper);
}
