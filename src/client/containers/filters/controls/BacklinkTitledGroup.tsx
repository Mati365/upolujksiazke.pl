import React, {ReactNode} from 'react';
import c from 'classnames';

import {ChevronLeftIcon} from '@client/components/svg';

type BacklinkTitledGroupProps = {
  children: ReactNode,
  primary?: boolean,
};

export const BacklinkTitledGroup = (
  {
    children,
    primary,
  }: BacklinkTitledGroupProps,
) => (
  <div
    className={c(
      'c-filters-backlink-group',
      primary && 'is-primary',
    )}
  >
    <ChevronLeftIcon className='c-filters-backlink-group__chevron' />
    <div className='c-filters-backlink-group__title'>
      {children}
    </div>
  </div>
);

BacklinkTitledGroup.displayName = 'BacklinkTitledGroup';
