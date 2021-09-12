import React, {ReactNode} from 'react';
import c from 'classnames';

import {CleanList} from '@client/components/ui';

type ChipsListProps = {
  className?: string,
  children?: ReactNode,
};

export const ChipsList = (
  {
    children,
    className,
  }: ChipsListProps,
) => (
  <CleanList
    className={c(
      'c-chips',
      className,
    )}
    spaced={2}
    inline
  >
    {children}
  </CleanList>
);

ChipsList.displayName = 'ChipsList';
