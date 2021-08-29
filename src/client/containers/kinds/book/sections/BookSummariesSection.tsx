import React from 'react';

import {useI18n} from '@client/i18n';

import {BookSummaryRecord} from '@api/types';
import {Section} from '@client/components/ui';
import {BookSummariesGrid} from '../grids';

type BookSummariesSectionProps = {
  items: BookSummaryRecord[],
  title?: string,
};

export const BookSummariesSection = ({items, title}: BookSummariesSectionProps) => {
  const t = useI18n('book.summaries');
  if (!items?.length)
    return null;

  return (
    <Section
      spaced={3}
      title={
        title ?? t('title')
      }
      subsection
      noContentSpacing
    >
      <BookSummariesGrid
        items={items}
        gap={4}
        columns={{
          xs: 1,
          default: 2,
        }}
      />
    </Section>
  );
};

BookSummariesSection.displayName = 'BookSummariesSection';
