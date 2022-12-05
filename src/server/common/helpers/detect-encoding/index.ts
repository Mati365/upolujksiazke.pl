import {TypedArray} from 'type-fest';
import iconv from 'iconv-lite';

import {getCharset} from './getCharset';

export function convertBody(
  content: Buffer | ArrayBuffer | SharedArrayBuffer | TypedArray,
  headers?: Headers,
): string {
  if (!Buffer.isBuffer(content)) {
    content = Buffer.from(content);
  }

  // Turn raw buffers into a single utf-8 buffer
  return iconv.decode(
    content as Buffer,
    getCharset(content as Buffer, headers),
  );
}
