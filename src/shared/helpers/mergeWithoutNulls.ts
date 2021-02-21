import * as R from 'ramda';

export function mergeWithoutNulls<T>(
  items: T[],
  mergeFn?: (key: keyof T, a: any, b: any) => any,
): T {
  if (R.isEmpty(items))
    return null;

  return R.reduce(
    (acc, item) => {
      if (!acc)
        return {...item};

      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          if (mergeFn)
            acc[key] = mergeFn(key, acc[key], item[key]);
          else
            acc[key] ??= item[key];
        }
      }

      return acc;
    },
    null,
    items,
  );
}
