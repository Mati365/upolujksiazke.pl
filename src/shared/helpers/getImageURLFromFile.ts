/**
 * Returns image url for preview from input[type=file]
 *
 * @export
 * @param {File | string} targetFile
 * @returns {(Promise<string | ArrayBuffer>)}
 */
export function getImageURLFromFile(targetFile: File | string): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      if (!targetFile) {
        resolve(null);
        return;
      }

      if (typeof targetFile === 'string') {
        resolve(targetFile);
        return;
      }

      const reader = new FileReader;

      reader.onerror = reject;
      reader.onload = (file) => {
        resolve(<string> file.target.result);
      };
      reader.readAsDataURL(targetFile);
    },
  );
}
