export function pickLongestArrayItem<T>(array: T[][]): T[] {
  let acc: T[] = null;

  for (const item of array) {
    if (!item)
      continue;

    if (!acc || acc.length < item.length)
      acc = item;
  }

  return acc;
}
