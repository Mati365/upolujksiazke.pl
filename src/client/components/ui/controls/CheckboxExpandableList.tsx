import React from 'react';
import c from 'classnames';

import {ListItem} from '@shared/types';
import {CheckboxList, CheckboxListProps} from './CheckboxList';
import {
  AsyncChunkAttributes,
  AsyncExpandableChunks,
  AsyncExpandableChunksProps,
} from '../AsyncExpandableChunks';

export type CheckboxExpandableListProps<T extends ListItem> = Omit<AsyncExpandableChunksProps<T>, 'renderChunkFn'> & {
  checkboxListProps?(attrs: AsyncChunkAttributes<T>): Partial<CheckboxListProps<T>>,
  listComponent?: any,
};

export function CheckboxExpandableList<T extends ListItem>(
  {
    className,
    checkboxListProps,
    listComponent: ListComponent = CheckboxList,
    ...props
  }: CheckboxExpandableListProps<T>,
) {
  return (
    <AsyncExpandableChunks<T>
      {...props}
      className={c(
        'c-expandable-checkox-list',
        className,
      )}
      renderChunkFn={
        (attr) => (
          <ListComponent
            lastSpaced
            items={attr.chunk}
            {...checkboxListProps?.(attr)}
          />
        )
      }
    />
  );
}
