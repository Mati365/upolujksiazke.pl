import * as R from 'ramda';

export const normalizeParsedText = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/[ ]{2,}/g, ' '),
    R.replace(/[\n]{2,}/g, '\n'),
    R.trim,
    R.when<string, string>(R.isEmpty, R.always(null)),
  ),
);

export const normalizeISBN = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/-/g, ''),
    R.trim,
  ),
);
