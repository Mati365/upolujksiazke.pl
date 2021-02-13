import {F_OK} from 'constants';
import fs from 'fs';

export function fileExistsSync(path: string) {
  return fs.existsSync(path);
}

export async function fileExistsAsync(path: string) {
  try {
    await fs.promises.access(path, F_OK);
    return true;
  } catch (e) {
    if (!e || e.code !== 'ENOENT')
      throw e;

    return false;
  }
}
