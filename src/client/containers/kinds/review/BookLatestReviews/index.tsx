import React from 'react';

import {useI18n} from '@client/i18n';

import {Button, Section, SectionProps} from '@client/components/ui';
import {CommentIcon} from '@client/components/svg';
import {BookFullInfoRecord} from '@api/types';
import {BookAllReviewsLink} from '@client/routes/Links';
import {BookReviewsList} from './BookReviewsList';

type BookLatestReviewsSectionProps = SectionProps & {
  book: BookFullInfoRecord,
};

export const BookLatestReviewsSection = (
  {
    book,
    ...props
  }: BookLatestReviewsSectionProps,
) => {
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
      titleSuffix={(
        <span className='c-flex-row is-inline'>
          <CommentIcon className='mr-1' />
          <span>
            {t('total', [book.totalTextReviews])}
          </span>
        </span>
      )}
      subsection
      noContentSpacing
      {...props}
    >
      <BookReviewsList reviews={reviews} />

      {reviews.length < book.totalTextReviews && (
        <div className='c-flex-center mt-6'>
          <Button
            className='is-text-small has-double-link-chevron'
            tag={BookAllReviewsLink}
            item={book}
            outlined
          >
            {t('show_more_reviews', [book.totalTextReviews - reviews.length])}
          </Button>
        </div>
      )}
    </Section>
  );
};

BookLatestReviewsSection.displayName = 'BookLatestReviewsSection';
