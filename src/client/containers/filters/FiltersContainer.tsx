import React, {ReactNode} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {QueryLoadingSpinner} from '@client/containers/parts/DefaultLoaders';

type FiltersContainerProps = {
  children: ReactNode,
  sidebar: ReactNode,
  className?: string,
  loading?: boolean,
  toolbarRenderFn?(): ReactNode,
};

export const FiltersContainer = (
  {
    children,
    sidebar,
    className,
    loading,
    toolbarRenderFn,
  }: FiltersContainerProps,
) => {
  const t = useI18n('shared.filters');
  const toolbar = toolbarRenderFn && (
    <div className='c-filters-section__toolbar'>
      {toolbarRenderFn()}
    </div>
  );

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

      <div
        className={c(
          'c-filters-section__content',
          loading && 'is-loading',
        )}
      >
        {toolbar}
        {children}
        {loading && (
          <QueryLoadingSpinner layer />
        )}
        {toolbar}
      </div>
    </section>
  );
};

FiltersContainer.displayName = 'FiltersContainer';
