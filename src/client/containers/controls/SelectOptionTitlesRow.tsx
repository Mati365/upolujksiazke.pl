import React, {memo} from 'react';
import c from 'classnames';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';
import {ID, ReactListItem} from '@shared/types';
import {CleanList, CleanListProps, TextButton} from '@client/components/ui';

export type SelectOptionTitlesRowProps = CleanListProps & LinkProps<ID> & {
  items: ReactListItem[],
};

export const SelectOptionTitlesRow = memo(linkInputs<ID>(
  {
    initialData: null,
  },
)((
  {
    l,
    value,
    items,
    ...props
  }: SelectOptionTitlesRowProps,
) => (
  <CleanList
    spaced={1}
    inline
    separated
    {...props}
  >
    {...items.map(
      (item) => (
        <li key={item.id}>
          <TextButton
            className={c(
              +value === +item.id && 'is-text-primary',
            )}
            title={item.title}
            aria-label={item.title}
            type='button'
            onClick={
              () => l.setValue(item.id)
            }
          >
            {item.name}
          </TextButton>
        </li>
      ),
    )}
  </CleanList>
)));
