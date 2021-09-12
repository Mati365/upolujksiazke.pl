import React, {ComponentType, ReactNode} from 'react';
import c from 'classnames';

import {
  UndecoratedLink,
  UndecoratedLinkProps,
} from '@client/components/ui';

type ChipsProps = UndecoratedLinkProps & {
  icon?: ComponentType<{className?: string}>,
  count?: ReactNode,
};

export const Chips = (
  {
    count,
    className,
    children,
    icon: Icon,
    ...props
  }: ChipsProps,
) => (
  <li
    className={c(
      'c-chips__item',
      !!Icon && 'has-icon',
      className,
    )}
  >
    <UndecoratedLink {...props}>
      {Icon && (
        <Icon className='c-chips__item-icon' />
      )}

      {children}

      {count && (
        <span className='c-chips__item-count'>
          {count}
        </span>
      )}
    </UndecoratedLink>
  </li>
);

Chips.displayName = 'Chips';
