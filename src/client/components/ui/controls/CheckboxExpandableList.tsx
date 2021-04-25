import React from 'react';

import {ListItem} from '@shared/types';
import {CheckboxList, CheckboxListProps} from './CheckboxList';
import {
  AsyncChunkAttributes,
  AsyncExpandableChunks,
  AsyncExpandableChunksProps,
} from '../AsyncExpandableChunks';

type CheckboxExpandableListProps<T extends ListItem> = Omit<AsyncExpandableChunksProps<T>, 'renderChunkFn'> & {
  checkboxListProps?(attrs: AsyncChunkAttributes<T>): Partial<CheckboxListProps<T>>,
  listComponent?: any,
};

export function CheckboxExpandableList<T extends ListItem>(
  {
    checkboxListProps,
    listComponent: ListComponent = CheckboxList,
    ...props
  }: CheckboxExpandableListProps<T>,
) {
  return (
    <AsyncExpandableChunks<T>
      {...props}
      renderChunkFn={
        (attr) => (
          <ListComponent
            items={attr.chunk}
            {...checkboxListProps?.(attr)}
          />
        )
      }
    />
  );
}
