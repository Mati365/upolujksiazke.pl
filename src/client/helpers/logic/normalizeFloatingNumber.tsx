import * as R from 'ramda';

export function normalizeFloatingNumber(value: number, precision: number = 2) {
  if (R.isNil(value))
    return null;

  return value.toFixed(precision).replace('.', ',');
}
