export function getArrayWithLengthLimit<T>(length: number): T[] {
  const array = new Array<T>();

  array.push = function limitedArrayPush(this: Array<T>, ...args) {
    if (this.length >= length)
      this.shift();

    return Array.prototype.push.apply(this, args);
  };

  return array;
}
