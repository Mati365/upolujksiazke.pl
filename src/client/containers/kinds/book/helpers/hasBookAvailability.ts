import * as R from 'ramda';
import {BookFullInfoRecord} from '@api/types';

export function hasBookAvailability(book: BookFullInfoRecord) {
  return !!book.releases && R.any((release) => !R.isEmpty(release.availability || []), book.releases);
}
