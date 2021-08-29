import React from 'react';

import {useI18n} from '@client/i18n';
import {capitalize} from '@shared/helpers';

import {BrandRecord} from '@api/types';
import {RecentBrochuresSection, RecentBrochuresSectionProps} from './RecentBrochuresSection';

export type RecentBrandBrochuresSectionProps = RecentBrochuresSectionProps & {
  brand: BrandRecord,
};

export const RecentBrandBrochuresSection = ({brand, ...props}: RecentBrandBrochuresSectionProps) => {
  const t = useI18n('sections');

  return (
    <RecentBrochuresSection
      title={
        t('recent_brand_brochures.title', [capitalize(brand.name)])
      }
      {...props}
    />
  );
};

RecentBrandBrochuresSection.displayName = 'RecentBrandBrochuresSection';
