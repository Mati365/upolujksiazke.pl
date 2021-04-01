import React, {ReactNode} from 'react';
import c from 'classnames';

import {CleanList} from '@client/components/ui';

type TitledTreeProps = {
  className?: string,
  title?: ReactNode,
  children?: ReactNode,
};

export const TitledTree = (
  {
    className,
    title,
    children,
  }: TitledTreeProps,
) => (
  <div
    className={c(
      'c-titled-tree',
      className,
    )}
  >
    <h2 className='c-titled-tree__title'>
      {title}
    </h2>

    <CleanList
      className='c-titled-tree__list c-tree'
      inline={false}
      block
    >
      {children}
    </CleanList>
  </div>
);

TitledTree.displayName = 'TitledTree';
