import React, {ReactNode} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';

import {QueryLoadingSpinner} from '@client/containers/parts/DefaultLoaders';
import {CleanList, TextButton} from '@client/components/ui';

type FiltersContainerProps = {
  children: ReactNode,
  sidebar?: ReactNode,
  contentHeader?: ReactNode,
  sidebarToolbar?: ReactNode,
  className?: string,
  loading?: boolean,
  toolbarRenderFn?(top: boolean): ReactNode,
  onClearFilters?(): void,
};

export const FiltersPaginationToolbar = ({children, className}: {children: ReactNode, className?: string}) => (
  <CleanList
    className={c(
      'c-filters-section__pagination-toolbar',
      className,
    )}
    spaced={4}
    separated
    inline
  >
    {children}
  </CleanList>
);

export const FiltersContainer = (
  {
    children,
    contentHeader,
    sidebar,
    sidebarToolbar,
    className,
    loading,
    toolbarRenderFn,
    onClearFilters,
  }: FiltersContainerProps,
) => {
  const t = useI18n('shared.filters');
  const ua = useUA();

  const noSidebar = ua.mobile || !sidebar;
  const renderToolbar = (top: boolean) => toolbarRenderFn && (
    <div
      className={c(
        'c-filters-section__toolbar',
        `is-${top ? 'top' : 'bottom'}`,
      )}
    >
      {toolbarRenderFn(top)}
    </div>
  );

  return (
    <section
      className={c(
        'c-filters-section',
        noSidebar && 'has-no-sidebar',
        className,
      )}
    >
      {!noSidebar && (
        <div className='c-filters-section__sidebar'>
          {sidebarToolbar && (
            <div className='c-filters-section__sidebar-toolbar'>
              {sidebarToolbar}
            </div>
          )}

          <h2 className='c-filters-section__sidebar-header'>
            {t('header')}

            {onClearFilters && (
              <TextButton
                className='is-text-tiny is-text-muted'
                onClick={onClearFilters}
              >
                {t('clear')}
              </TextButton>
            )}
          </h2>

          {sidebar}
        </div>
      )}

      <div
        className={c(
          'c-filters-section__content',
          loading && 'is-loading',
        )}
      >
        {contentHeader}
        {renderToolbar(true)}
        <div className='c-filters-section__items'>
          {children}
        </div>

        {loading && (
          <QueryLoadingSpinner layer />
        )}
        {renderToolbar(false)}
      </div>
    </section>
  );
};

FiltersContainer.displayName = 'FiltersContainer';
