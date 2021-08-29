import * as R from 'ramda';

import {BookFullInfoReleaseRecord} from '@api/types';
import {sortReleasesAvailability} from './sortReleasesAvailability';

export function sortReleasesByPrice(releases: BookFullInfoReleaseRecord[]) {
  const sortedAvailability = sortReleasesAvailability(releases);

  return R.sortBy(
    ({availability}) => availability?.[0]?.price ?? Infinity,
    sortedAvailability,
  );
}
