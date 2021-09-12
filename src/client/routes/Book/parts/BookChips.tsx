import React, {useMemo} from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {hasBookAvailability} from '@client/containers/kinds/book/helpers';

import {BookFullInfoRecord} from '@api/types';
import {ChipsList, Chips} from '@client/containers/kinds/chips';
import {
  CommentIcon,
  PurchaseIcon,
  NewsIcon,
  BookOpenIcon,
  CategoryIcon,
} from '@client/components/svg';

type BookChipsProps = {
  book: BookFullInfoRecord,
};

export const BookChips = ({book}: BookChipsProps) => {
  const t = useI18n('routes.book.chips');
  const totalAvailability = useMemo(
    () => {
      if (!hasBookAvailability(book))
        return null;

      return book.releases.reduce(
        (acc, item) => (item.availability?.length || 0) + acc,
        0,
      );
    },
    [book],
  );

  return (
    <ChipsList>
      {!R.isEmpty(book.reviews) && (
        <Chips
          hash='latest-reviews'
          count={book.totalTextReviews}
          icon={CommentIcon}
        >
          {t('reviews')}
        </Chips>
      )}

      {totalAvailability > 0 && (
        <Chips
          hash='availability'
          count={totalAvailability}
          icon={PurchaseIcon}
        >
          {t('availability')}
        </Chips>
      )}

      {!R.isEmpty(book.summaries) && (
        <Chips
          hash='summaries'
          count={book.summaries.length}
          icon={NewsIcon}
        >
          {t('summaries')}
        </Chips>
      )}

      {book.description && (
        <Chips
          hash='description'
          icon={BookOpenIcon}
        >
          {t('description')}
        </Chips>
      )}

      <Chips
        hash='categories'
        icon={CategoryIcon}
      >
        {t('categories')}
      </Chips>
    </ChipsList>
  );
};

BookChips.displayName = 'BookChips';
