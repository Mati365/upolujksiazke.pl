import * as fs from 'fs';
import * as zlib from 'zlib';
import {fileExistsAsync} from '../fileUtils';

type UngzipAttrs = {
  src: string,
  dest: string,
  deleteSrc?: boolean,
};

export async function ungzipFile({src, dest, deleteSrc}: UngzipAttrs): Promise<string> {
  if (!src || !(await fileExistsAsync(src)))
    return null;

  return new Promise((resolve, reject) => {
    const srcStream = fs.createReadStream(src);
    const destStream = fs.createWriteStream(dest);

    srcStream.pipe(zlib.createGunzip()).pipe(destStream);
    destStream.on('close', () => {
      if (deleteSrc) {
        fs
          .promises
          .rm(src)
          .then(() => resolve(dest))
          .catch(reject);
      } else
        resolve(dest);
    });
  });
}
