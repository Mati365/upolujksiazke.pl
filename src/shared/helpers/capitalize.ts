import * as R from 'ramda';

export const capitalize = R.when(
  R.is(String),
  R.replace(/^./, R.toUpper),
);
