import React, {ReactNode} from 'react';
import c from 'classnames';

import {CleanList} from '@client/components/ui';

type TreeProps = {
  className?: string,
  children?: ReactNode,
};

export const Tree = (
  {
    className,
    children,
  }: TreeProps,
) => (
  <CleanList
    className={c(
      'c-tree',
      className,
    )}
    inline={false}
    block
  >
    {children}
  </CleanList>
);

Tree.displayName = 'Tree';
