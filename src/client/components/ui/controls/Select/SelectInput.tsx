import React, {useMemo, useState} from 'react';
import c from 'classnames';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';
import {findById} from '@shared/helpers';
import {isListItem} from '@shared/guards/isListItem';

import {
  useOutsideClickRef,
  useUpdateEffect,
} from '@client/hooks';

import {ID, ListItem} from '@shared/types';
import {DownArrowIcon} from '@client/components/svg';

import {SelectOptions} from './SelectOptions';
import {Input, InputProps} from '../Input';

export type SelectInputProps = LinkProps<ListItem|ID> & {
  returnOnlyId?: boolean,
  className?: string,
  items?: ListItem[],
  inputProps?: InputProps,
};

export const SelectInput = linkInputs<ListItem|ID>(
  {
    initialData: null,
  },
)((
  {
    returnOnlyId,
    className,
    l,
    items,
    value,
    inputProps,
  }: SelectInputProps,
) => {
  const [active, setActive] = useState(false);
  const outsideRef = useOutsideClickRef<HTMLDivElement>(
    () => {
      if (active)
        setActive(false);
    },
  );

  const selected = useMemo(
    () => (
      isListItem(value)
        ? value
        : findById(+value)(items)
    ),
    [value],
  );

  useUpdateEffect(
    () => {
      if (active)
        setActive(false);
    },
    [value],
  );

  return (
    <div
      ref={outsideRef}
      className={c(
        'c-select-input',
        active && 'is-active',
        className,
      )}
    >
      <Input
        {...inputProps}
        value={selected?.name}
        className={c(
          'c-select-input__field',
          inputProps?.className,
        )}
        iconRight={(
          <DownArrowIcon />
        )}
        readOnly
        onChange={
          () => {}
        }
        onClick={
          () => setActive(!active)
        }
      />

      {active && (
        <SelectOptions
          items={items}
          selected={selected}
          onOptionSelected={
            (item) => l.setValue(
              returnOnlyId
                ? item.id
                : item,
            )
          }
        />
      )}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';
