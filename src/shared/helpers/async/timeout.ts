/**
 * Creates timeout promise
 *
 * @export
 * @param {number} ms
 * @returns
 */
export function timeout(ms: number) {
  return new Promise(
    (resolve) => {
      setTimeout(resolve, ms);
    },
  );
}
