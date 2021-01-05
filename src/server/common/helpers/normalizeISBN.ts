import * as R from 'ramda';

export const normalizeISBN = R.unless(
  R.isNil,
  R.pipe(
    R.replace(/-/g, ''),
    R.trim,
  ),
);
