import React from 'react';
import c from 'classnames';

import {ID, IconListItem} from '@shared/types';
import {CleanList} from '../CleanList';
import {TextButton} from '../TextButton';

type MobileOptionsListProps = {
  items: IconListItem[],
  className?: string,
  selected?: ID,
  onSelect?(id: ID, item: IconListItem): void,
};

export const MobileOptionsList = (
  {
    items,
    selected,
    className,
    onSelect,
  }: MobileOptionsListProps,
) => (
  <CleanList
    className={c(
      'c-mobile-options-list',
      className,
    )}
    inline={false}
    block
  >
    {items.map(
      (item) => {
        const {id, name, icon: Icon} = item;

        return (
          <li
            key={id}
            className={c(
              'c-mobile-options-list__item',
              selected === id && 'is-active',
            )}
          >
            <TextButton
              onClick={
                () => onSelect?.(id, item)
              }
            >
              {Icon && (
                <Icon className='c-mobile-options-list__item-icon' />
              )}
              {name}
            </TextButton>
          </li>
        );
      },
    )}
  </CleanList>
);

MobileOptionsList.displayName = 'MobileOptionsList';
