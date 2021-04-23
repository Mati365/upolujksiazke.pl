import React, {ReactNode} from 'react';
import * as R from 'ramda';
import {SmallFiltersCounter} from './controls';

type FiltersGroupProps = {
  header: ReactNode,
  children?: ReactNode,
  total?: ReactNode,
};

export const FiltersGroup = ({header, children, total}: FiltersGroupProps) => (
  <section className='c-filters-group'>
    <header className='c-filters-group__header'>
      {header}
      {!R.isNil(total) && (
        <SmallFiltersCounter count={total} />
      )}
    </header>

    <div className='c-filters-group__content'>
      {children}
    </div>
  </section>
);

FiltersGroup.displayName = 'FiltersGroup';
