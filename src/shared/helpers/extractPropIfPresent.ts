/**
 * If object contains named prop extracts it
 *
 * @export
 * @param {string} name
 * @param {Object} obj
 * @return {*}
 */
export function extractPropIfPresent(name: string, obj: any): any {
  if (!obj)
    return null;

  if (name in obj)
    return obj[name];

  return obj;
}
