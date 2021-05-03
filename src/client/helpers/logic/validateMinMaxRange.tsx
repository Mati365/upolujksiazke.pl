import * as R from 'ramda';
import {MinMaxRange} from '@shared/types';

export function validateMinMaxRange(range: any): MinMaxRange {
  if (!range)
    return null;

  const output: MinMaxRange = {};
  if (!R.isNil(range.min) && !Number.isNaN(range.min))
    output.min = +range.min;

  if (!R.isNil(range.max) && !Number.isNaN(range.max))
    output.max = +range.max;

  return (
    R.isEmpty(output)
      ? null
      : output
  );
}
