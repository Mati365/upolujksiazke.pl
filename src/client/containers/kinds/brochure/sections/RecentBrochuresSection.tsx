import React from 'react';

import {useI18n} from '@client/i18n';

import {BrochureCardRecord} from '@api/types';
import {Section, SectionProps} from '@client/components/ui';
import {BrochuresGrid} from '../grids';

export type RecentBrochuresSectionProps = SectionProps & {
  items: BrochureCardRecord[],
  title?: string,
};

export const RecentBrochuresSection = ({items, title, children, ...props}: RecentBrochuresSectionProps) => {
  const t = useI18n('sections');
  if (!items?.length)
    return null;

  return (
    <Section
      spaced={3}
      title={
        title ?? t('recent_brochures.title')
      }
      subsection
      noContentSpacing
      {...props}
    >
      <BrochuresGrid
        items={items}
        gap={5}
        columns={{
          xs: 2,
          default: 7,
        }}
      />
      {children}
    </Section>
  );
};

RecentBrochuresSection.displayName = 'RecentBrochuresSection';
