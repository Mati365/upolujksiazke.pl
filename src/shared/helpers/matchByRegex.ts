export type RegExpMatchArray<T> = [RegExp, () => T][];

/**
 * Chooses basic string match by regexes in object keys
 *
 * @export
 * @template T
 * @param {(Readonly<Record<string, () => T> | RegExpMatchArray<T>>)} options
 * @param {string} str
 * @returns
 */
export function matchByRegex<T>(options: Readonly<Record<string, () => T> | RegExpMatchArray<T>>, str: string) {
  if (options instanceof Array) {
    for (const [regex, fn] of options) {
      if (regex.test(str))
        return fn();
    }
  } else {
    for (const key in options) {
      if (!Object.prototype.hasOwnProperty.call(options, key))
        continue;

      if (new RegExp(key).test(str))
        return options[key]();
    }
  }

  return null;
}
