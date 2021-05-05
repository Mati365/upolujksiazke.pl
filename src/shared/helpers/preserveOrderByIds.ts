import {uniqFlatHashByProp} from './uniqFlatHashByProp';

export function preserveOrderByIds<T>(
  {
    idField = 'id',
    ids,
    items,
  }: {
    idField?: string,
    ids: number[],
    items: T[],
  },
) {
  const map = uniqFlatHashByProp(idField, items);

  return (
    ids
      .map((id) => map[id])
      .filter(Boolean)
  );
}
