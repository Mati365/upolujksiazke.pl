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
};

export function CheckboxExpandableList<T extends ListItem>(
  {
    checkboxListProps,
    ...props
  }: CheckboxExpandableListProps<T>,
) {
  return (
    <AsyncExpandableChunks<T>
      {...props}
      renderChunkFn={
        (attr) => (
          <CheckboxList
            items={attr.chunk}
            {...checkboxListProps?.(attr)}
          />
        )
      }
    />
  );
}
