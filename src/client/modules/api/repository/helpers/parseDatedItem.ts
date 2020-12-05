import {DatedItem} from '@shared/types';

export function parseDatedItem<R extends DatedItem>(item: R): R {
  return {
    ...item,
    updatedAt: new Date(item.updatedAt),
    createdAt: new Date(item.createdAt),
  };
}
