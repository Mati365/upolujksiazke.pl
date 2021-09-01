import * as path from 'path';
import {fileExistsAsync} from './fileUtils';

export function isLockAvailable(name: string) {
  return fileExistsAsync(
    path.resolve(__dirname, 'locks', `${name}.lock`),
  );
}
