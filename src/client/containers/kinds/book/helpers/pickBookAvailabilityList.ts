import * as R from 'ramda';

import {BookFullInfoRecord, BookFullInfoReleaseRecord} from '@api/types';
import {TypedBookAvailabilityRecord} from './pickAllBookTypedReleases';

/**
 * Picks plain list of releases from book with types
 *
 * @export
 * @param {BookFullInfoRecord} book
 * @return {TypedBookAvailabilityRecord[]}
 */
export function pickBookAvailabilityList(book: BookFullInfoRecord): TypedBookAvailabilityRecord[] {
  return R.reduce<BookFullInfoReleaseRecord, TypedBookAvailabilityRecord[]>(
    (acc, release) => {
      if (!R.isEmpty(release.availability)) {
        acc.push(
          ...release.availability.map((availability) => ({
            ...availability,
            bookType: release.type,
          })),
        );
      }

      return acc;
    },
    [],
    book.releases,
  );
}
