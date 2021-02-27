/**
 * Removes unecessary prefixes from publisher names
 *
 * @export
 * @param {string} name
 * @returns
 */
export function normalizePublisherTitle(name: string) {
  return name?.replace(/^(wydawnictwo|wydawca)\s*/i, '');
}
