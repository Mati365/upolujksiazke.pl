import React, {Fragment} from 'react';
import * as R from 'ramda';

import {ENV} from '@client/constants/env';

import {formatDate} from '@shared/helpers';
import {
  genAllBookReviewsLink,
  prefixLinkWithHost,
} from '@client/routes/Links';

import {BookReviewEntity} from '@server/modules/book/modules/review';
import {BookEntity} from '@server/modules/book';
import {CommentedBookStats} from '../../constants/types';

import {formatRatingStars} from '../../helpers';

export type LatestCommentBookReviewsProps = {
  reviews: BookReviewEntity[],
  stats: CommentedBookStats,
  book: BookEntity,
};

export const LatestCommentBookReviews = (
  {
    reviews,
    stats,
    book,
  }: LatestCommentBookReviewsProps,
) => {
  if (!reviews || R.isEmpty(reviews)) {
    return (
      <strong>Jesteś pierwszym recenzentem tej książki tutaj :)</strong>
    );
  }

  return (
    <>
      <strong>Ostatnie recenzje tej książki:</strong>
      <>
        {reviews.map(
          (review, index) => (
            <Fragment key={review.id}>
              <br />
              {`${index + 1}. `}
              <strong>
                {formatDate(review.publishDate)}
              </strong>
              {' - Użytkownik '}
              <strong>
                {review.reviewer.name}
              </strong>
              {' ocenił na: '}
              {formatRatingStars(review.rating)}
              {' - '}
              <a
                href={review.url}
                target='_blank'
                rel='noreferrer'
              >
                <strong>
                  Wpis »
                </strong>
              </a>
            </Fragment>
          ),
        )}
        {reviews.length < stats.totalReviews && (
          <>
            <br />
            {`... zobacz resztę fragmentów recenzji (${stats.totalReviews - reviews.length}) na: `}
            <a
              href={
                prefixLinkWithHost(genAllBookReviewsLink(book))
              }
              target='_blank'
              rel='noreferrer'
            >
              {ENV.shared.website.name}
            </a>
          </>
        )}
      </>
    </>
  );
};
