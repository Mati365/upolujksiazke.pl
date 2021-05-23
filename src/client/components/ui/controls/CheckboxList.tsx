import React, {ReactNode} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {ListItem} from '@shared/types';
import {linkInputs, LinkProps} from '@client/decorators/linkInput';
import {CleanList, CleanListProps} from '../CleanList';
import {CheckboxGroup} from './CheckboxGroup';

type CheckboxesValuesMap = Record<string, any>;

export type CheckboxListProps<T extends ListItem = ListItem> = CleanListProps & LinkProps<CheckboxesValuesMap> & {
  className?: string,
  items?: T[],
  children?: ReactNode,
  renderNameFn?(item: T): ReactNode,
};

export const CheckboxList = linkInputs<CheckboxesValuesMap>(
  {
    initialData: {},
  },
)((
  {
    className,
    items,
    l,
    value,
    children,
    renderNameFn = R.prop('name'),
    ...props
  }: CheckboxListProps,
) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <CleanList
    block
    inline={false}
    className={c(
      'c-checkbox-list',
      className,
    )}
    {...props}
  >
    {items?.map(
      (item) => (
        <li key={item.id}>
          <CheckboxGroup
            {...l.input(
              item.id,
              {
                assignValueParserFn: (val) => !!val,
                valueParserFn: (val) => (val ? item : null),
              },
            )}
          >
            {renderNameFn(item)}
          </CheckboxGroup>
        </li>
      ),
    )}
    {children}
  </CleanList>
));

CheckboxList.displayName = 'CheckboxList';
