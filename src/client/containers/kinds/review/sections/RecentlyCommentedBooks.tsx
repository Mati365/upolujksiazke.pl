import React from 'react';

import {useI18n} from '@client/i18n';

import {BookReviewRecord} from '@api/types';
import {Section, SectionProps} from '@client/components/ui';
import {BookLink} from '@client/routes/Links';
import {BookReviewsList} from '../list/BookReviewsList';

type RecentlyCommendedBooksProps = SectionProps & {
  items: BookReviewRecord[],
};

export const RecentlyCommendedBooks = (
  {
    items,
    ...props
  }: RecentlyCommendedBooksProps,
) => {
  const t = useI18n('sections.recently_commented_books');

  return (
    <Section
      title={
        t('title')
      }
      {...props}
    >
      <BookReviewsList
        grid
        reviews={items}
        itemPropsFn={
          (review) => ({
            showBookCard: true,
            moreButtonRenderFn: ({expandTitle}) => (
              <BookLink
                className='c-promo-tag-link is-text-semibold ml-2'
                undecorated={false}
                item={review.book}
                hash={`review-${review.id}`}
                withChevron
              >
                {expandTitle}
              </BookLink>
            ),
          })
        }
      />
    </Section>
  );
};

RecentlyCommendedBooks.displayName = 'RecentlyCommendedBooks';
