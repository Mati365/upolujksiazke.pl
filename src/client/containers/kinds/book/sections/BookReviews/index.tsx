import React from 'react';

import {useI18n} from '@client/i18n';

import {Section} from '@client/components/ui';
import {BookFullInfoRecord} from '@api/types';
import {BookReviewsList} from './BookReviewsList';

type BookReviewsSectionProps = {
  book: BookFullInfoRecord,
};

export const BookReviewsSection = ({book}: BookReviewsSectionProps) => {
  const t = useI18n('book.reviews');
  const {reviews} = book;

  if (!reviews?.length)
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
      <BookReviewsList reviews={reviews} />
    </Section>
  );
};

BookReviewsSection.displayName = 'BookReviewsSection';
