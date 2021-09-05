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

export function monthDuration(date: Date = new Date) {
  return {
    begin: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  };
}

export function nthMonthsAgoDuration(months: number, date: Date = new Date) {
  return monthDuration(
    new Date(date.getFullYear(), date.getMonth() - months, 1),
  );
}
