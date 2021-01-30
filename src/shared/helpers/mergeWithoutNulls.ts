import * as R from 'ramda';

export function mergeWithoutNulls<T>(items: T[]): T {
  if (R.isEmpty(items))
    return null;

  return R.reduce(
    (acc, item) => {
      if (!acc)
        return {...item};

      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key))
          acc[key] ??= item[key];
      }

      return acc;
    },
    null,
    items,
  );
}
