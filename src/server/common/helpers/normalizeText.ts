import * as R from 'ramda';

export const normalizeParsedText = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/[ ]{2,}/g, ''),
    R.trim,
  ),
);

export const normalizeISBN = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/-/g, ''),
    R.trim,
  ),
);
