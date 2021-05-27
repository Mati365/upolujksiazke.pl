export * from './bookTypes';
export * from './bookSummaries';
export * from './imageVersion';
export * from './language';
export * from './school';
export * from './tracker';

export enum SortMode {
  ACCURACY = 1,
  POPULARITY = 2,
  ALPHABETIC = 3,
  RECENTLY_ADDED = 4,
}

export enum SortDirection {
  DESC = 'desc',
  ASC = 'asc',
  NORMAL = '',
}

export enum ViewMode {
  GRID = 1,
  LIST = 2,
}

export enum Gender {
  UNKNOWN = 1,
  FEMALE = 2,
  MALE = 3,
}
