import React, {PropsWithChildren} from 'react';
import c from 'classnames';

export type BasicBadgeProps = PropsWithChildren<{
  className?: string,
}>;

export const Badge = ({children, className}: BasicBadgeProps) => (
  <span className={c('c-badge', className)}>
    {children}
  </span>
);

Badge.displayName = 'Badge';
