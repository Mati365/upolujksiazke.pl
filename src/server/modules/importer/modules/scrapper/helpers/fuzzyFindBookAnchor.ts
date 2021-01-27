import * as R from 'ramda';
import stringSimilarity from 'string-similarity';
import {normalizeParsedText} from '@server/common/helpers';

type BookSimilarityFields = {
  title: string,
  author?: string,
};

export const normalizeObjFields = R.mapObjIndexed(
  (title) => normalizeParsedText(title)?.toLowerCase(),
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
  const [lowerTitle, lowerAuthor] = [
    title.toLowerCase(),
    author.toLowerCase(),
  ];

  const item = R.head(
    R.sort(
      (a, b) => b[0] - a[0],
      $
        .toArray()
        .map((el): [number, cheerio.Element] => {
          const selected = <BookSimilarityFields> normalizeObjFields(anchorSelector(el));
          const similarity = (
            stringSimilarity.compareTwoStrings(lowerTitle || '', selected.title || '')
              * (selected.author ? stringSimilarity.compareTwoStrings(lowerAuthor || '', selected.author || '') : 1)
          );

          return (
            similarity < 0.5
              ? null
              : [similarity, el]
          );
        })
        .filter(Boolean),
    ),
  );

  if (!item || item[0] < 0.5)
    return null;

  return item[1];
}
