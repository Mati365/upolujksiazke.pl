import * as R from 'ramda';

export const safeToNumber = R.unless(R.isNil, (n) => +n);
