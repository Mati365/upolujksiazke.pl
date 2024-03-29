import fs from 'fs';
import {mkdirpSync, mkdirp} from 'fs-extra';

import {
  fileExistsSync,
  fileExistsAsync,
} from './fileUtils';

export function removeDirIfExistsSync(path: string) {
  if (fileExistsSync(path))
    fs.rmSync(path, {recursive: true});
}

export async function removeDirIfExistsAsync(path: string) {
  if (await fileExistsAsync(path))
    await fs.promises.rm(path, {recursive: true});
}

export async function removeAndCreateDirSync(path: string) {
  removeDirIfExistsSync(path);
  mkdirpSync(path);
  return path;
}

export async function removeAndCreateDirAsync(path: string) {
  await removeDirIfExistsAsync(path);
  await mkdirp(path);
  return path;
}

export async function isEmptyDirAsync(path: string) {
  return fs.promises.readdir(path).then((files) => !files.length);
}
