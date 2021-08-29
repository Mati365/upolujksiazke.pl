export function uniqFlatHashBy<T>(fn: (item: T) => string, items: T[]): Record<string, T> {
  const acc: Record<string, T> = {};

  for (const item of items)
    acc[fn(item)] = item;

  return acc;
}

export function uniqFlatHashByProp<T>(prop: string, items: T[]): Record<string, T> {
  return uniqFlatHashBy(
    (item) => item[prop],
    items,
  );
}
