export function groupRawMany<E>(
  {
    items,
    key,
    mapperFn,
  }: {
    items: any[],
    key: string,
    mapperFn?(item: any): E,
  },
) {
  return items.reduce<Record<number, E[]>>(
    (acc, entity) => {
      const keyValue = entity[key];

      delete entity[key];
      (acc[keyValue] ||= []).push(
        mapperFn(entity),
      );

      return acc;
    },
    {},
  );
}
