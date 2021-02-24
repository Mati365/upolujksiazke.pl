import * as R from 'ramda';
import stringSimilarity from 'string-similarity';

import {normalizeParsedText} from '@server/common/helpers';
import {safeArray} from '@shared/helpers';

import {CanBeArray} from '@shared/types';

type BookSimilarityFields = {
  title: string,
  author?: CanBeArray<string>,
};

const normalizeAuthorField = (author: string) => R.sortBy(R.identity, author.toLowerCase().split(' ')).join(' ');
const normalizeTextField = (text: string) => normalizeParsedText(text)?.toLowerCase();

export const normalizeObjFields = R.mapObjIndexed(
  (title: CanBeArray<string>) => (
    title instanceof Array
      ? title.map(normalizeTextField)
      : normalizeTextField(title)
  ),
);

export function fuzzyFindBookAnchor(
  {
    $,
    book: {
      title,
      author,
    },
    anchorSelector,
  }: {
    $: cheerio.Cheerio,
    book: BookSimilarityFields,
    anchorSelector(anchor: cheerio.Element): BookSimilarityFields,
  },
) {
  const [lowerTitle, lowerAuthors] = [
    title.toLowerCase(),
    <string[]> safeArray(author).map(normalizeAuthorField),
  ];

  const item = R.head(
    R.sort(
      (a, b) => b[0] - a[0],
      $
        .toArray()
        .map((el): [number, cheerio.Element] => {
          const selected = <BookSimilarityFields> normalizeObjFields(anchorSelector(el));
          let authorSimilarity = 1;

          if (selected.author) {
            authorSimilarity = 0;

            const rowAuthors = safeArray(selected.author).map(normalizeAuthorField);
            for (const sourceAuthor of lowerAuthors) {
              for (const rowAuthor of rowAuthors) {
                authorSimilarity = Math.max(
                  authorSimilarity,
                  stringSimilarity.compareTwoStrings(sourceAuthor || '', rowAuthor || ''),
                );
              }
            }
          }

          const similarity = (
            stringSimilarity.compareTwoStrings(lowerTitle || '', selected.title || '')
              * authorSimilarity
          );

          return (
            similarity < 0.6
              ? null
              : [similarity, el]
          );
        })
        .filter(Boolean),
    ),
  );

  return item?.[1];
}
