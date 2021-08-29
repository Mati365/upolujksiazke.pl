import * as R from 'ramda';

export const safeToString = R.unless(R.is(String), R.toString);
