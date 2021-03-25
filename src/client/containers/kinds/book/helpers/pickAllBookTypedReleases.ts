import * as R from 'ramda';

import {
  BookAvailabilityRecord,
  BookFullInfoRecord,
} from '@api/types';

import {BookType} from '@shared/enums';

export type TypedBookAvailabilityRecord = BookAvailabilityRecord & {
  bookType?: BookType,
};

export function pickAllBookTypedReleases(book: BookFullInfoRecord) {
  const mappedReleases = book.releases.map(
    (release) => (release.availability || []).map<TypedBookAvailabilityRecord>(
      (item) => ({
        ...item,
        bookType: release.type,
      }),
    ),
  );

  return R.unnest(mappedReleases);
}
