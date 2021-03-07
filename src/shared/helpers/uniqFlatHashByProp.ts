export function uniqFlatHashByProp<T>(prop: string, items: T[]): Record<string, T> {
  const acc: Record<string, T> = {};

  for (const item of items)
    acc[item[prop]] = item;

  return acc;
}
