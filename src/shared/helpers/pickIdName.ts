import {ListItem} from '@shared/types';

export function pickIdName<T extends Partial<ListItem>>(item: T): ListItem;
export function pickIdName<T extends Partial<ListItem>>(item: T[]): ListItem[];

export function pickIdName<T extends Partial<ListItem>>(item: T|T[]): ListItem|ListItem[] {
  if (item instanceof Array)
    return (item as any).map(pickIdName);

  return {
    id: item.id,
    name: item.name,
  };
}
