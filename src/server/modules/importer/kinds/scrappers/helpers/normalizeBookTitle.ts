import * as R from 'ramda';

import {safeToString} from '@shared/helpers';
import {trimBorderSpecialCharacters} from '@server/common/helpers/text/trimBorderSpecialCharacters';
import {parseIfRomanNumber} from '@server/common/helpers/text';

import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookSeriesDto} from '@server/modules/book/modules/series/dto/CreateBookSeries.dto';
import {
  CreateBookVolumeDto,
  DEFAULT_BOOK_VOLUME_NAME,
} from '@server/modules/book/modules/volume/dto/CreateBookVolume.dto';

import {BOOK_TYPE_TRANSLATION_MAPPINGS} from '../Book.scrapper';

/* eslint-disable quote-props */
export const BOOK_VOLUME_ALIESES = {
  'pierwszy': '1', 'drugi': '2', 'trzeci': '3',
  'czwarty': '4', 'piąty': '5', 'szósty': '6',
  'siódmy': '7', 'ósmy': '8', 'dziewiąty': '9',
  'dziesiąty': '10', 'jedenasty': '11', 'duwnasty': '12',
  'one': '1', 'two': '2', 'three': '3',
  'four': '4', 'five': '5', 'six': '6',
  'seven': '7', 'eight': '8', 'nine': '9',
  'ten': '10', 'eleven': '11', 'twelve': '12',
};
/* eslint-enable quote-props */

export type NormalizedBookTitleInfo = {
  title: string,
  volume: string,
  edition: string,
  series?: string,
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

  const result = name.match(
    /(?<left>.*)?(?:[\\s.,(]|^)*(?<type>cd(?:\\s*mp3)?|ebook|audiobook)(?:[\\s.,)]|$)(?<right>.*)?/i,
  );

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
 * Removes separators etc from volume title
 *
 * @export
 * @param {string} title
 * @returns
 */
export function normalizeVolumeTitle(title: string) {
  if (!title)
    return null;

  return title.replace(/[,:;]/g, '-');
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
    /(?<title>.*)(?:[\s.,(]+(?<type>tom|wydanie|część)(?:[\s.,)]+|$)(?<part>[\w-,]+))[,.\s:]*(?<rest>.*)?/i,
  );

  // check shortcut form
  result ||= name.match(/(?<title>.*)(?:[\s.,]+(?<type>t|w)\.\s*(?<part>\d+))[,.\s:]*(?<rest>.*)/i);

  // hash number
  result ||= name.match(/(?<title>.*)(?:[\s.,(]+(?<type>#)\s*(?<part>\d+))[,.\s:)]*(?<rest>.*)/i);

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
  if (!editionType && part) {
    volume = safeToString(parseIfRomanNumber(part));
    volume = BOOK_VOLUME_ALIESES[volume.toLowerCase()] || volume;
  } else
    volume = null;

  return R.mapObjIndexed(
    (item) => item?.trim() || null,
    {
      volume: normalizeVolumeTitle(volume),
      edition: editionType ? part : null,
      title: R.uniq(
        [title, rest]
          .filter(Boolean)
          .map((str) => trimBorderSpecialCharacters(str)),
      ).join(': '),
    },
  );
}

/**
 * Picks series from title
 *
 * @export
 * @param {string} name
 */
export function extractBookSeries(name: string) {
  // ending with keyword and has number before
  let result = name.match(/(?<title>.+)\s(?<volume>\d+)\.?\s*Cykl.\s*(?<series>[^\d]+)$/i);

  // ending with keyword
  result ||= name.match(/(?<title>.+)\.?\s*Cykl.\s*(?<series>[^\d]+)(?:\s*(?<volume>\d+)?|$)/i);

  // starting with keyword
  result ||= name.match(/^Cykl.\s*(?<series>[^\d:.]+)(?:\s*(?<volume>\d+)?)?[:.]\s*(?<title>.+)\s*$/i);

  if (!result) {
    return {
      title: name,
      series: null,
      volume: null,
    };
  }

  const {groups: {title, series, volume}} = result;
  return {
    title: trimBorderSpecialCharacters(title),
    series: series?.trim(),
    volume: normalizeVolumeTitle(volume),
  };
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
  let series: string = null;

  if (secondPass.title.match(/cykl/i)) {
    const thirdPass = extractBookSeries(secondPass.title);

    if (thirdPass) {
      series = thirdPass.series;
      secondPass.title = thirdPass.title;
      secondPass.volume ??= thirdPass.volume;
    }
  }

  return {
    type,
    series,
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
    series,
    volume: volumeName,
  } = normalizeBookTitle(book.defaultTitle || book.title);

  return new CreateBookDto(
    {
      ...book,
      defaultTitle: title,
      series: series && [
        new CreateBookSeriesDto(
          {
            name: series,
          },
        ),
      ],
      volume: volumeName && new CreateBookVolumeDto(
        {
          name: volumeName,
        },
      ),
    },
  );
}
