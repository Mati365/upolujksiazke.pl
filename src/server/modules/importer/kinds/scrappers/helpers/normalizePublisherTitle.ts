import {trimBorderSpecialCharacters} from '@server/common/helpers/text/trimBorderSpecialCharacters';

/**
 * Removes unecessary prefixes from publisher names
 *
 * @export
 * @param {string} name
 * @returns
 */
export function normalizePublisherTitle(name: string) {
  return trimBorderSpecialCharacters(
    name?.replace(/^(wydawnictwo|wydawca)\s*/i, ''),
  );
}
