import {Duration} from '../types';

/**
 * Get previous year begin date
 *
 * @export
 * @param {number} [nth=1]
 * @returns {Date}
 */
export function getLastYear(nth: number = 1): Date {
  const today = new Date();

  return new Date(
    today.getFullYear() - nth,
    1,
    1,
  );
}

/**
 * Get previous month begin date
 *
 * @export
 * @param {number} [nth=1]
 * @returns {Date}
 */
export function getLastMonth(nth: number = 1): Date {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth() - nth,
    1,
  );
}

/**
 * Get previous week begin date
 *
 * @export
 * @param {number} [nth=1]
 * @returns {Date}
 */
export function getLastWeek(nth: number = 1): Date {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 7 * nth,
  );
}

/**
 * Get begin and end date of month
 *
 * @export
 * @param {Date} date
 * @returns {Duration}
 */
export function getMonthDuration(date: Date = new Date): Duration {
  return {
    begin: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  };
}

/**
 * Get begin and end date of month
 *
 * @export
 * @param {Date} date
 * @returns {Duration}
 */
export function getWeekDuration(date: Date = new Date): Duration {
  const currentWeekDay = date.getDay();
  const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
  const wkStart = new Date(new Date(date).setDate(date.getDate() - lessDays));
  const wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

  return {
    begin: wkStart,
    end: wkEnd,
  };
}

/**
 * Get begin and end date of year
 *
 * @export
 * @param {Date} [date=new Date]
 * @returns {Duration}
 */
export function getYearDuration(date: Date = new Date): Duration {
  const year = date.getFullYear();

  return {
    begin: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  };
}

/**
 * Transform duration with Date objects into duration with string
 *
 * @export
 * @param {Duration} duration
 * @returns {StringDuration}
 */
export function castDurationToISO(duration: Duration<Date>): Duration<string> {
  if (!duration)
    return null;

  const {begin, end} = duration;
  return {
    begin: begin?.toISOString(),
    end: end?.toISOString(),
  };
}
