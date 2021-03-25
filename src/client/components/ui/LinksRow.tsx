import React, {ComponentType, ReactNode} from 'react';
import c from 'classnames';

import {ID} from '@shared/types';

import {
  CleanList,
  CleanListProps,
  UndecoratedLinkProps,
} from '@client/components/ui';

type LinksRowProps = CleanListProps & {
  className?: string,
  separated?: boolean,
  linkComponent: ComponentType<UndecoratedLinkProps<any, {}>>,
  linkProps?: Partial<UndecoratedLinkProps<any, {}>>,
  items: {
    id: ID,
    name?: ReactNode,
  }[],
};

export const LinksRow = (
  {
    className, items, separated,
    linkComponent: Link,
    linkProps, ...props
  }: LinksRowProps,
) => (
  <CleanList
    className={c(
      'c-links-row',
      separated && 'is-separated',
      className,
    )}
    spaced={(
      separated
        ? 3
        : 2
    )}
    inline
    wrap
    {...props}
  >
    {items.map(
      (item) => (
        <li key={item.id}>
          <Link
            item={item}
            {...linkProps}
          >
            {item.name}
          </Link>
        </li>
      ),
    )}
  </CleanList>
);

LinksRow.displayName = 'LinksRow';
