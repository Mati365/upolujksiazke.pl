import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {mergeWithoutNulls} from '@shared/helpers/mergeWithoutNulls';

export const mergeReleases = (releases: CreateBookReleaseDto[]) => mergeWithoutNulls(releases, (key, a, b) => {
  switch (key) {
    case 'availability':
      return [...(a || []), ...(b || [])];

    default:
      return a ?? b;
  }
});
