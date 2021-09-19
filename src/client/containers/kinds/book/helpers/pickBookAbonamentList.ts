import * as R from 'ramda';

import {
  BookAvailabilityRecord,
  BookFullInfoReleaseRecord,
} from '@api/types';

/**
 * Picks plain list of availability with abonament
 *
 * @export
 * @param {BookFullInfoReleaseRecord[]} releases
 * @return {BookAvailabilityRecord[]}
 */
export function pickBookAbonamentList(releases: BookFullInfoReleaseRecord[]): BookAvailabilityRecord[] {
  return R.reduce<BookFullInfoReleaseRecord, BookAvailabilityRecord[]>(
    (acc, release) => {
      const abonament = (release.availability || []).filter(R.propEq('inAbonament', true));

      return [
        ...acc,
        ...abonament,
      ];
    },
    [],
    releases || [],
  );
}
