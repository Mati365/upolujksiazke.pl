import React, {ReactNode} from 'react';
import c from 'classnames';

import {CleanList} from '@client/components/ui';

type TreeProps = {
  className?: string,
  size?: string,
  children?: ReactNode,
};

export const Tree = (
  {
    className,
    size,
    children,
  }: TreeProps,
) => (
  <CleanList
    className={c(
      'c-tree',
      size && `is-${size}`,
      className,
    )}
    inline={false}
    block
  >
    {children}
  </CleanList>
);

Tree.displayName = 'Tree';
