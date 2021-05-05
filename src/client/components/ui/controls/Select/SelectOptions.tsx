import React from 'react';
import c from 'classnames';

import {ListItem} from '@shared/types';
import {CleanList} from '../../CleanList';

export type SelectOptionsProps = {
  items: ListItem[],
  selected?: ListItem,
  onOptionSelected?(item: ListItem): void,
};

export const SelectOptions = (
  {
    items,
    selected,
    onOptionSelected,
  }: SelectOptionsProps,
) => (
  <CleanList
    block
    inline={false}
    className='c-select-input__list'
  >
    {items?.map(
      (item) => (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <li
          key={item.id}
          className={c(
            selected
              && selected.id === item.id
              && 'is-active',
          )}
          onClick={
            () => onOptionSelected?.(item)
          }
        >
          {item.name}
        </li>
      ),
    )}
  </CleanList>
);

SelectOptions.displayName = 'SelectOptions';
