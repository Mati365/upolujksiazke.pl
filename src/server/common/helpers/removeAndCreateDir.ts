import {F_OK} from 'constants';
import fs from 'fs';

export function removeDirIfExistsSync(path: string) {
  try {
    fs.accessSync(path, F_OK);
    fs.rmSync(path, {recursive: true});
  } catch (e) {
    if (!e || e.code !== 'ENOENT')
      throw e;
  }
}

export async function removeDirIfExistsAsync(path: string) {
  try {
    await fs.promises.access(path, F_OK);
    await fs.promises.rm(path, {recursive: true});
  } catch (e) {
    if (!e || e.code !== 'ENOENT')
      throw e;
  }
}

export async function removeAndCreateDirSync(path: string) {
  removeDirIfExistsSync(path);
  fs.mkdirSync(path);
  return path;
}

export async function removeAndCreateDirAsync(path: string) {
  await removeDirIfExistsAsync(path);
  await fs.promises.mkdir(path);
  return path;
}
