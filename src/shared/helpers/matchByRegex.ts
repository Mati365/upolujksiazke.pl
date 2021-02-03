/**
 * Chooses basic string match by regexes in object keys
 *
 * @export
 * @template T
 * @param {Record<string, () => T>} options
 * @param {string} str
 * @returns
 */
export function matchByRegex<T>(options: Record<string, () => T>, str: string) {
  for (const key in options) {
    if (!Object.prototype.hasOwnProperty.call(options, key))
      continue;

    if (new RegExp(key).test(str))
      return options[key]();
  }

  return null;
}
