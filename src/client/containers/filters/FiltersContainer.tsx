import React, {ReactNode} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

type FiltersContainerProps = {
  children: ReactNode,
  sidebar: ReactNode,
  className?: string,
};

export const FiltersContainer = (
  {
    children,
    sidebar,
    className,
  }: FiltersContainerProps,
) => {
  const t = useI18n('shared.filters');

  return (
    <section
      className={c(
        'c-filters-section',
        className,
      )}
    >
      <div className='c-filters-section__sidebar'>
        <h4 className='c-filters-section__sidebar-header'>
          {t('header')}
        </h4>

        {sidebar}
      </div>

      <div className='c-filters-section__content'>
        {children}
      </div>
    </section>
  );
};

FiltersContainer.displayName = 'FiltersContainer';
