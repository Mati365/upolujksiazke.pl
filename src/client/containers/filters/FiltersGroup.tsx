import React, {ReactNode} from 'react';

type FiltersGroupProps = {
  header: ReactNode,
  children?: ReactNode,
};

export const FiltersGroup = ({header, children}: FiltersGroupProps) => (
  <section className='c-filters-group'>
    <header className='c-filters-group__header'>
      {header}
    </header>

    <div className='c-filters-group__content'>
      {children}
    </div>
  </section>
);

FiltersGroup.displayName = 'FiltersGroup';
