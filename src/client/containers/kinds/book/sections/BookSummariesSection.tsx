import React from 'react';

import {useI18n} from '@client/i18n';

import {BookFullInfoRecord} from '@api/types';
import {Section} from '@client/components/ui';
import {BookSummariesGrid} from '../grids';

type BookSummariesSectionProps = {
  book: BookFullInfoRecord,
};

export const BookSummariesSection = ({book}: BookSummariesSectionProps) => {
  const t = useI18n('book.summaries');
  if (!book.summaries?.length)
    return null;

  return (
    <Section
      spaced={3}
      title={
        t('title')
      }
      subsection
      noContentSpacing
    >
      <BookSummariesGrid
        items={book.summaries}
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
