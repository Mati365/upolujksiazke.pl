import * as R from 'ramda';

export function truncateReviewerName(name: string) {
  if (name.length <= 3)
    return 'unknown';

  return `${name[0]}${R.repeat('.', name.length - 2).join('')}${R.last(name)}`;
}
