/**
 * Generates random file name for multer
 *
 * @export
 * @param {string | false} extension
 * @returns
 */
export function genUniqueFilename(extension?: string | false) {
  const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');

  return `${randomName}.${extension || 'bin'}`;
}
