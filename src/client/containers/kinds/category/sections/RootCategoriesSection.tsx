import React from 'react';

import {useI18n} from '@client/i18n';

import {Section} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {CategoriesGrid} from '../grids/CategoriesGrid';

type RecentBooksSectionProps = {
  items: BookCategoryRecord[],
};

export const RootCategoriesSection = ({items}: RecentBooksSectionProps) => {
  const t = useI18n();

  return (
    <Section
      title={
        t('sections.root_categories.title')
      }
    >
      <CategoriesGrid items={items} />
    </Section>
  );
};

RootCategoriesSection.displayName = 'RootCategoriesSection';
