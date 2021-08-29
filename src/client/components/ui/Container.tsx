import React, {PropsWithChildren} from 'react';
import c from 'classnames';

export type BasicWrapperProps = PropsWithChildren<{
  className?: string,
  expandable?: boolean,
}>;

export const Container = ({children, expandable, className}: BasicWrapperProps) => (
  <div
    className={c(
      'c-container',
      expandable && 'is-expandable',
      className,
    )}
  >
    {children}
  </div>
);

Container.displayName = 'Container';
