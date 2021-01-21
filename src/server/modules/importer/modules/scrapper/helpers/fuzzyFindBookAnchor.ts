import * as R from 'ramda';
import stringSimilarity from 'string-similarity';
import {normalizeParsedText} from '@server/common/helpers';

type BookSimilarityFields = {
  title: string,
  author: string,
};

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
          const itemTitle = normalizeParsedText(anchorSelector(el))?.toLowerCase();
          const similarity = stringSimilarity.compareTwoStrings(lowerTitle, itemTitle);

          if (similarity < 0.5)
            return null;

          const authorTitle = normalizeParsedText(el)?.toLowerCase();
          return [
            stringSimilarity.compareTwoStrings(lowerAuthor, authorTitle),
            el,
          ];
        })
        .filter(Boolean),
    ),
  );

  if (!item || item[0] < 0.5)
    return null;

  return item[1];
}
