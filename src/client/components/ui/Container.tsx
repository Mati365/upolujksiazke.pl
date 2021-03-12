import React, {PropsWithChildren} from 'react';
import c from 'classnames';

export type BasicWrapperProps = PropsWithChildren<{
  className?: string,
}>;

export const Container = ({children, className}: BasicWrapperProps) => (
  <div className={c('c-container', className)}>
    {children}
  </div>
);

Container.displayName = 'Container';
