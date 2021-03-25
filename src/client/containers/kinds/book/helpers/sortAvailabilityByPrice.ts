import * as R from 'ramda';
import {BookAvailabilityRecord} from '@api/types';

export function sortAvailabilityByPrice(availability: BookAvailabilityRecord[]) {
  return R.sortBy(
    ({price}) => price ?? Infinity,
    availability || [],
  );
}
