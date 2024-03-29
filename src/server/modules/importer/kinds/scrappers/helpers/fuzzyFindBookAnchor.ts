import * as R from 'ramda';
import stringSimilarity from 'string-similarity';

import {safeArray} from '@shared/helpers';
import {CanBeArray} from '@shared/types';

import {normalizeParsedText} from '@server/common/helpers';
import {normalizeBookTitle, NormalizedBookTitleInfo} from './normalizeBookTitle';

type BookSimilarityFields = {
  title: string,
  volume?: string,
  author?: CanBeArray<string>,
};

export function orderAuthorField(author: string) {
  if (!author)
    return null;

  const normalized = normalizeParsedText(author);
  if (!normalized)
    return null;

  return R.sortBy(
    R.identity,
    normalized.toLowerCase().split(' '),
  ).join(' ');
}

/**
 * Calculate similarity between books based on titles
 *
 * @export
 * @param {Pick<NormalizedBookTitleInfo, 'title'|'volume'>} a
 * @param {Pick<NormalizedBookTitleInfo, 'title'|'volume'>} b
 * @returns
 */
export function getNormalizedBooksSimilarity(
  a: Pick<NormalizedBookTitleInfo, 'title' | 'volume'>,
  b: Pick<NormalizedBookTitleInfo, 'title' | 'volume'>,
) {
  let similarity = (
    stringSimilarity.compareTwoStrings(a.title || '', b.title || '')
  );

  if (similarity > 0.5 && a.volume === b.volume)
    similarity *= 1.15;

  return similarity;
}

/**
 * Compares authors strings
 *
 * @export
 * @param {CanBeArray<string>} a
 * @param {CanBeArray<string>} b
 * @returns
 */
export function fuzzyAuthorsSimilarity(a: CanBeArray<string>, b: CanBeArray<string>) {
  let authorSimilarity = 0;

  const aAuthors = safeArray(a).map((title) => orderAuthorField(title).toLowerCase());
  const bAuthors = safeArray(b).map((title) => orderAuthorField((title).toLowerCase()));

  for (const sourceAuthor of aAuthors) {
    for (const rowAuthor of bAuthors) {
      authorSimilarity = Math.max(
        authorSimilarity,
        stringSimilarity.compareTwoStrings(sourceAuthor || '', rowAuthor || ''),
      );
    }
  }

  return authorSimilarity;
}

/**
 * Picks most similar books from list
 *
 * @export
 * @template T
 * @param {Object} attrs
 * @returns
 */
export function fuzzyFindMatchingBook<T>(
  {
    book: {
      title,
      author,
    },
    items,
    mapperFn = R.identity as any,
  }: {
    book: BookSimilarityFields,
    items: T[],
    mapperFn?(item: T): BookSimilarityFields,
  },
) {
  const source = normalizeBookTitle(title.toLowerCase());
  const lowerAuthors = <string[]> safeArray(author || []).map(orderAuthorField);

  const output = R.head(
    R.sort(
      (a, b) => b[0] - a[0],
      items
        .map((item): [number, T] => {
          if (!item)
            return null;

          const selectorValue = mapperFn(item);
          if (!selectorValue)
            return null;

          const selected = {
            ...normalizeBookTitle(selectorValue.title?.toLowerCase()),
            author: safeArray(selectorValue.author || []).map(orderAuthorField),
          };

          let authorSimilarity = author ? 0 : 1;

          if (!lowerAuthors.length)
            authorSimilarity = 1;
          else if (selected.author) {
            authorSimilarity = 0;

            for (const sourceAuthor of lowerAuthors) {
              for (const rowAuthor of selected.author) {
                authorSimilarity = Math.max(
                  authorSimilarity,
                  stringSimilarity.compareTwoStrings(sourceAuthor || '', rowAuthor || ''),
                );
              }
            }
          }

          const similarity = (
            getNormalizedBooksSimilarity(source, selected) * authorSimilarity
          );

          return (
            similarity < (author ? 0.6 : 0.82)
              ? null
              : [similarity, item]
          );
        })
        .filter(Boolean),
    ),
  );

  return output?.[1];
}

/**
 * Matches similar anchor
 *
 * @export
 * @param {Object} attrs
 * @returns
 */
export function fuzzyFindBookAnchor(
  {
    $,
    book,
    anchorSelector,
  }: {
    $: cheerio.Cheerio,
    book: BookSimilarityFields,
    anchorSelector(anchor: cheerio.Element): BookSimilarityFields,
  },
) {
  return fuzzyFindMatchingBook(
    {
      book,
      mapperFn: anchorSelector,
      items: $.toArray(),
    },
  );
}
