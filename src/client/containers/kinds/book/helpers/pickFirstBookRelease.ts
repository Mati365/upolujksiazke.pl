import * as R from 'ramda';
import {BookFullInfoRecord} from '@api/types';

export const pickFirstBookRelease = (
  {
    releases,
  }: Pick<BookFullInfoRecord, 'releases'>,
) => (
  R.sortBy(
    (release) => +release.publishDate.match(/\d{4}/)?.[0],
    releases.filter((release) => !!release.publishDate),
  )?.[0]
);
