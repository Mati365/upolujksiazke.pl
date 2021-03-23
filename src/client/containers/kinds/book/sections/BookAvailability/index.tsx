import React from 'react';

import {useI18n} from '@client/i18n';

import {BookFullInfoRecord} from '@api/types';
import {Section} from '@client/components/ui';
import {BookPricesList} from './BookPricesList';

type BookAvailabilitySectionProps = {
  book: BookFullInfoRecord,
};

export const BookAvailabilitySection = ({book}: BookAvailabilitySectionProps) => {
  const t = useI18n();

  return (
    <Section
      spaced={3}
      title={
        t('book.availability.title')
      }
      subsection
      noContentSpacing
    >
      <BookPricesList book={book} />
    </Section>
  );
};

BookAvailabilitySection.displayName = 'BookAvailabilitySection';
