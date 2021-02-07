export function getArrayWithLengthLimit<T>(length: number): T[] {
  const array = new Array<T>();

  array.push = function limitedArrayPush(this: Array<T>, ...args) {
    const newLength = Array.prototype.push.apply(this, args);
    const toRemove = newLength - length;

    if (toRemove > 0) {
      if (toRemove === 1)
        this.shift();
      else
        this.splice(0, toRemove);
    }

    return newLength;
  };

  return array;
}
