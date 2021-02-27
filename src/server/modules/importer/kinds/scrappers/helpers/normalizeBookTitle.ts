import * as R from 'ramda';

import {safeToString} from '@shared/helpers';
import {trimBorderSpecialCharacters} from '@server/common/helpers/text/trimBorderSpecialCharacters';
import {parseIfRomanNumber} from '@server/common/helpers/text';

import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {
  CreateBookVolumeDto,
  DEFAULT_BOOK_VOLUME_NAME,
} from '@server/modules/book/modules/volume/dto/CreateBookVolume.dto';

import {
  BOOK_TYPE_TRANSLATION_MAPPINGS,
  BOOK_TYPE_TITLE_REGEX,
} from '../Book.scrapper';

export type NormalizedBookTitleInfo = {
  title: string,
  volume: string,
  edition: string,
  type: BookType,
};

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

  // check separator form
  let result = name.match(/(?<title>.*)(?:- (?<part>\d+) -)\s*(?<rest>.*)/i);

  // old form
  result ||= name.match(/(?<title>.*)(?:Księga (?<part>\d+))[\s,.]*(?<rest>.*)/i);

  // check long form
  result ||= name.match(
    /(?<title>.*)(?:[\s.,(]+(?<type>tom|wydanie|część)(?:[\s.,)]+|$)(?<part>[\w]+))[,.\s:]*(?<rest>.*)?/i,
  );

  // check shortcut form
  result ||= name.match(/(?<title>.*)(?:[\s.,]+(?<type>t|w)\.\s*(?<part>\d+))[,.\s:]*(?<rest>.*)/i);

  if (!result) {
    return {
      title: trimBorderSpecialCharacters(name),
      volume: null,
      edition: null,
    };
  }

  const {groups: {title, type, part, rest}} = result;
  const lowerType = type?.toLowerCase();
  const editionType = lowerType === 'wydanie' || lowerType === 'w';

  let volume: string = null;
  if (!editionType && part)
    volume = safeToString(parseIfRomanNumber(part));
  else
    volume = null;

  return R.mapObjIndexed(
    (item) => item?.trim() || null,
    {
      volume,
      edition: editionType ? part : null,
      title: (
        [title, rest]
          .filter(Boolean)
          .map((str) => trimBorderSpecialCharacters(str))
          .join(': ')
      ),
    },
  );
}

/**
 * Extract all useful info from title
 *
 * @param {string} name
 * @returns {NormalizedBookTitleInfo}
 */
export function normalizeBookTitle(name: string): NormalizedBookTitleInfo {
  if (!name)
    return null;

  const {type, title} = dropBookType(
    name.replace(/[ ]{2,}/g, ' '),
  );

  // fixme: sucky performance
  const firstPass = extractBookPostifxes(title);
  const secondPass = extractBookPostifxes(firstPass.title);

  return {
    type,
    edition: firstPass.edition ?? secondPass.edition,
    volume: firstPass.volume ?? secondPass.volume ?? DEFAULT_BOOK_VOLUME_NAME,
    title: secondPass.title,
  };
}

/**
 * Drop unecessary data from name and assigns volume
 *
 * @export
 * @param {CreateBookDto} book
 */
export function normalizeBookDTO(book: CreateBookDto) {
  const {
    title,
    volume: volumeName,
  } = normalizeBookTitle(book.defaultTitle || book.title);

  return new CreateBookDto(
    {
      ...book,
      defaultTitle: title,
      volume: volumeName && new CreateBookVolumeDto(
        {
          name: volumeName,
        },
      ),
    },
  );
}
