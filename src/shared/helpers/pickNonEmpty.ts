import * as R from 'ramda';

export const pickNonEmpty = R.pickBy(
  (val) => !R.isNil(val) && !R.isEmpty(val),
);
