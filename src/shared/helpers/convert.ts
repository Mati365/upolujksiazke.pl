import * as R from 'ramda';

export const convertBytesToKilobytes = R.divide(R.__, 1024);
