import * as R from 'ramda';

/**
 * Extract list of files from object
 *
 * @export
 * @param {Object} obj
 * @param {string} [prefix='']
 * @returns {{path: string, file: File}[]}
 */
export function extractFiles(obj: Object, prefix: string = ''): {path: string, file: File}[] {
  const files = [];

  const appendEachFile = (infix: string) => (
    (value: any, key: string) => {
      const path = `${!infix.length ? '' : `${infix}.`}${key}`;

      if (R.is(File, value)) {
        files.push({
          path,
          file: value,
        });
      } else if (R.is(Object, value)) {
        R.forEachObjIndexed(appendEachFile(path), value);
      }
    }
  );

  R.forEachObjIndexed(
    appendEachFile(prefix),
    obj,
  );

  return files;
}
