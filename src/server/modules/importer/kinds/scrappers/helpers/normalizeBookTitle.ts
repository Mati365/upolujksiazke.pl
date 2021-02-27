import * as R from 'ramda';

import {trimBorderSpecialCharacters} from '@server/common/helpers/text/trimBorderSpecialCharacters';
import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';

import {
  BOOK_TYPE_TRANSLATION_MAPPINGS,
  BOOK_TYPE_TITLE_REGEX,
} from '../Book.scrapper';

/**
 * Drops book type from name and returns type
 *
 * @param {string} name
 * @returns
 */
export function dropBookType(name: string): {
  title: string,
  type: BookType,
} {
  if (!name)
    return null;

  const result = name.match(BOOK_TYPE_TITLE_REGEX);
  if (!result) {
    return {
      title: name,
      type: BookType.PAPER,
    };
  }

  const {groups: {left, type, right}} = result;
  return {
    title: `${left || ''} ${right || ''}`.trim(),
    type: BOOK_TYPE_TRANSLATION_MAPPINGS[type?.toLowerCase()] ?? BookType.PAPER,
  };
}

/**
 * Some books have not necessary titles suffixes, extract them
 *
 * @param {string} name
 * @returns
 */
export function extractBookPostifxes(name: string): {
  title: string,
  volume: string,
  edition: string,
} {
  if (!name)
    return null;

  const result = name.match(/(?<title>.*)(?:[\s.,]+(?<type>tom|wydanie|część)(?:[\s.,]+|$)(?<part>[\w]+))/i);
  if (!result) {
    return {
      title: trimBorderSpecialCharacters(name),
      volume: null,
      edition: null,
    };
  }

  const {groups: {title, type, part}} = result;
  const editionType = type.toLowerCase() === 'wydanie';

  return R.mapObjIndexed(
    (item) => item?.trim() || null,
    {
      title: trimBorderSpecialCharacters(title),
      volume: !editionType ? part : null, // todo: convert IX to 9 etc
      edition: editionType ? part : null,
    },
  );
}

/**
 * Extract all useful info from title
 *
 * @param {string} name
 * @returns
 */
export function normalizeBookTitle(name: string) {
  if (!name)
    return null;

  const {type, title} = dropBookType(
    name.replace(/[ ]{2,}/g, ' '),
  );

  return {
    type,
    ...extractBookPostifxes(title),
  };
}
