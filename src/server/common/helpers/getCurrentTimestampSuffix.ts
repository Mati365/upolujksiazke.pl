/**
 * Returns timestamp suffix used for file generation
 *
 * @export
 * @returns
 */
export function getCurrentTimestampSuffix() {
  const d = new Date;
  const time = [
    d.getMonth(),
    d.getDay(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  ].map(
    (num) => num.toString().padStart(2, '0'),
  );

  return [
    d.getFullYear(),
    ...time,
    d.getMilliseconds().toString().padStart(3, '0'),
  ].join('');
}
