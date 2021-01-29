import * as R from 'ramda';

export const normalizeParsedText: (str: string) => string = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/[ ]{2,}/g, ' '),
    R.replace(/[\n]{2,}/g, '\n'),
    R.trim,
    R.when<string, string>(R.isEmpty, R.always(null)),
  ),
);

export const normalizeParsedTitle = (title: string) => {
  const normalizedText = normalizeParsedText(title);

  return normalizedText.match(/(?:.*#\d+\s-\s*)?([^().#]*)/)?.[1] ?? normalizedText;
};

export const normalizeISBN = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/-/g, ''),
    R.trim,
  ),
);

export const normalizeURL = R.unless(
  R.isNil,
  R.when(
    R.startsWith('//'),
    R.concat('https:'),
  ),
);

export function normalizePrice(str: string) {
  if (!str)
    return null;

  const [, value, currency] = R.match(
    /(\d+[.,]\d+)\s*(\S+)?/,
    normalizeParsedText(str),
  );

  if (R.isNil(value) && R.isNil(currency))
    return null;

  return {
    price: Number.parseFloat(value.replace(',', '.')), // it should be decimal?
    currency: currency?.toLowerCase(),
  };
}
