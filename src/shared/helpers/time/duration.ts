import type {Duration} from '@shared/types';
import {convertDaysToSeconds} from './conversion';

export function nthDaysAgoDuration(days: number, end: Date = new Date): Duration {
  return {
    begin: new Date((+end) - convertDaysToSeconds(days) * 1000),
    end,
  };
}

export function nthWeeksAgoDuration(weeks: number, end: Date = new Date): Duration {
  return nthDaysAgoDuration(7 * weeks, end);
}
