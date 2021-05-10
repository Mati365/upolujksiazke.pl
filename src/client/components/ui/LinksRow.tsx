import React, {ComponentType, ReactNode} from 'react';
import c from 'classnames';

import {ID, CanBeFunction} from '@shared/types';

import {
  CleanList,
  CleanListProps,
  UndecoratedLinkProps,
} from '@client/components/ui';

type LinkRowItem = {
  id: ID,
  name?: ReactNode,
};

type LinksRowProps<T = any> = CleanListProps & {
  className?: string,
  separated?: boolean,
  linkComponent: ComponentType<UndecoratedLinkProps<T, {}>>,
  linkProps?: CanBeFunction<Partial<UndecoratedLinkProps<T, {}>>, LinkRowItem>,
  items: LinkRowItem[],
};

export function LinksRow<LinkType = any>(
  {
    className, items, separated,
    linkComponent: Link,
    linkProps, ...props
  }: LinksRowProps<LinkType>,
) {
  return (
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
              item={item as any}
              {...(
                linkProps && linkProps instanceof Function
                  ? linkProps(item)
                  : linkProps
              )}
            >
              {item.name}
            </Link>
          </li>
        ),
      )}
    </CleanList>
  );
}

LinksRow.displayName = 'LinksRow';
