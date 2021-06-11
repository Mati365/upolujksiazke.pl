import * as R from 'ramda';
import {dig} from './dig';

export const INNER_ITEM_MATCH_REGEX: RegExp = /%{([?.\w]*)}/g; // match = 1

/**
 * Inserts into template string with %{} characters variables
 *
 * @example
 * "test ${}" => "test variableValue"
 *
 * @export
 * @param {string} str
 * @param {(object|Array<any>)} params
 * @returns {string}
 */
export function format(str: string, params: object | Array<any>): string {
  let counter = 0;

  return str.replace(
    INNER_ITEM_MATCH_REGEX,
    (_, match) => {
      if (R.is(String, match) && match.length) {
        if (match.indexOf('.') !== -1)
          return dig(match, params);

        return params[match];
      }

      return params[counter++];
    },
  );
}

/**
 * Formats date to time string HH:MM:SS
 *
 * @export
 * @param {Date} date
 * @param {boolean} [withSeconds=true]
 * @param {string} [separator=':']
 * @returns {string}
 */
export function formatTime(
  date: Date,
  withSeconds: boolean = true,
  separator: string = ':',
): string {
  if (!date)
    return null;

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  let formatted = `${hours}${separator}${minutes}`;
  if (withSeconds) {
    const seconds = date.getSeconds().toString().padStart(2, '0');
    formatted = `${formatted}${separator}${seconds}`;
  }

  return formatted;
}

/**
 * Formats date to string
 *
 * @export
 * @param {string|Date} date
 * @param {boolean} [withDay=true]
 * @param {boolean} [withTime=false]
 * @param {boolean} [withSeconds=false]
 * @returns {string}
 */
export function formatDate(
  date: string | Date,
  withDay: boolean = true,
  withTime: boolean = false,
  withSeconds: boolean = false,
): string {
  if (!date)
    return null;

  if (typeof date === 'string')
    date = new Date(date);

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  let formatted = `${date.getFullYear()}-${month}`;
  if (withDay)
    formatted = `${formatted}-${day}`;

  if (withTime)
    formatted = `${formatted} ${formatTime(date, withSeconds)}`;

  return formatted;
}
