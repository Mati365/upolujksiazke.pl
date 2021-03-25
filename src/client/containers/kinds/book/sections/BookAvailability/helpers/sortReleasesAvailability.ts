import * as R from 'ramda';

import {BookFullInfoReleaseRecord} from '@api/types';
import {sortAvailabilityByPrice} from './sortAvailabilityByPrice';

export function sortReleasesAvailability(releases: BookFullInfoReleaseRecord[]) {
  return R.map(
    R.evolve(
      {
        availability: sortAvailabilityByPrice,
      },
    ),
    releases,
  );
}
