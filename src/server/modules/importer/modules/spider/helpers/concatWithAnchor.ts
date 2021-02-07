import path from 'path';
import {concatUrls} from '@shared/helpers/concatUrls';

function dropPathLastSegment(pathname: string) {
  const lastSlashIndex = pathname.lastIndexOf('/');
  if (lastSlashIndex === -1)
    return pathname;

  return pathname.substr(0, lastSlashIndex);
}

/**
 * Concat link with links such as /link or link
 *
 * @export
 * @param {string} root
 * @param {string} relative
 */
export function concatWithAnchor(root: string, relative: string) {
  const rootURL = new URL(root);

  if (relative[0] === '/')
    return concatUrls(rootURL.origin, relative);

  return concatUrls(
    rootURL.origin,
    path.join(
      dropPathLastSegment(rootURL.pathname),
      relative,
    ),
  );
}
