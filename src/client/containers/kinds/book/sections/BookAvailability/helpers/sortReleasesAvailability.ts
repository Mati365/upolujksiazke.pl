import * as R from 'ramda';
import {BookFullInfoReleaseRecord} from '@api/types';

export function sortReleasesAvailability(releases: BookFullInfoReleaseRecord[]) {
  return R.map(
    (release) => ({
      ...release,
      availability: R.sortBy(
        ({price}) => price ?? Infinity,
        release.availability || [],
      ),
    }),
    releases,
  );
}
