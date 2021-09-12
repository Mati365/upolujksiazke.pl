import React, {ReactNode} from 'react';
import c from 'classnames';

import {CleanList} from '@client/components/ui';

export type ChipsListProps = {
  noSpace?: boolean,
  className?: string,
  children?: ReactNode,
};

export const ChipsList = (
  {
    noSpace,
    children,
    className,
  }: ChipsListProps,
) => (
  <CleanList
    className={c(
      'c-chips',
      noSpace && 'has-no-space',
      className,
    )}
    spaced={2}
    inline
  >
    {children}
  </CleanList>
);

ChipsList.displayName = 'ChipsList';
