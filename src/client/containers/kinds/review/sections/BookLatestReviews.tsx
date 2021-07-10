import React, {ReactNode} from 'react';

import {useI18n} from '@client/i18n';

import {Button, Section, SectionProps} from '@client/components/ui';
import {CommentIcon} from '@client/components/svg';
import {BookFullInfoRecord} from '@api/types';
import {BookAllReviewsLink} from '@client/routes/Links';
import {BookReviewsList} from '../list/BookReviewsList';

type BookLatestReviewsSectionProps = SectionProps & {
  book: BookFullInfoRecord,
  toolbar?: ReactNode,
};

export const BookLatestReviewsSection = (
  {
    book,
    toolbar,
    ...props
  }: BookLatestReviewsSectionProps,
) => {
  const t = useI18n('book.reviews');
  const {reviews, totalTextReviews} = book;

  if (!reviews?.length && !toolbar)
    return null;

  return (
    <Section
      spaced={3}
      title={
        t('title')
      }
      titleSuffix={
        totalTextReviews > 0 && (
          <span className='c-flex-row is-inline'>
            <CommentIcon className='mr-1' />
            <span>
              {t('total', [totalTextReviews])}
            </span>
          </span>
        )
      }
      subsection
      noContentSpacing
      {...props}
    >
      {toolbar}

      <BookReviewsList reviews={reviews} />

      {reviews.length < totalTextReviews && (
        <div className='c-flex-center mt-6'>
          <Button
            className='is-text-small has-double-link-chevron'
            tag={BookAllReviewsLink}
            item={book}
            outlined
          >
            {t('show_more_reviews', [totalTextReviews - reviews.length])}
          </Button>
        </div>
      )}
    </Section>
  );
};

BookLatestReviewsSection.displayName = 'BookLatestReviewsSection';
