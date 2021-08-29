export function findObjValue<T>(
  fn: (value: T[keyof T], key: keyof T) => boolean,
  obj: T,
) {
  for (const key in obj) {
    const value = obj[key];

    if (fn(<any> value, <any> key))
      return value;
  }

  return null;
}
