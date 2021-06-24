import React from 'react';

import {useI18n} from '@client/i18n';

import {Section, SectionProps} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {CategoriesGrid, CategoriesGridProps} from '../grids/CategoriesGrid';

type RecentBooksSectionProps = {
  items: BookCategoryRecord[],
  gridProps?: Omit<CategoriesGridProps, 'items'>,
  sectionProps?: SectionProps,
};

export const RootCategoriesSection = (
  {
    items,
    gridProps,
    sectionProps,
  }: RecentBooksSectionProps,
) => {
  const t = useI18n();

  return (
    <Section
      headerSpace='medium'
      title={
        t('sections.root_categories.title')
      }
      {...sectionProps}
    >
      <CategoriesGrid
        items={items}
        {...gridProps}
      />
    </Section>
  );
};

RootCategoriesSection.displayName = 'RootCategoriesSection';
