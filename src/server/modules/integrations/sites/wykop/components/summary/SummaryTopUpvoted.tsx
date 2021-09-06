import React, {Fragment, ReactNode} from 'react';
import * as R from 'ramda';

import {BookCardRecord} from '@api/types';
import {
  genAllBookReviewsLink,
  prefixLinkWithHost,
} from '@client/routes/Links';

import {truncateText} from '@shared/helpers';
import {formatRatingStars} from '../../helpers';
import {WykopOptionalMatchReview} from '../../constants/types';

type BotSummaryTopUpvotedProps = {
  top: WykopOptionalMatchReview[],
};

export const BotSummaryTopUpvoted = ({top}: BotSummaryTopUpvotedProps) => {
  const wrapWithBookLinkIfPresent = (book: BookCardRecord, link: ReactNode) => {
    if (!book)
      return link;

    return (
      <a
        href={
          prefixLinkWithHost(genAllBookReviewsLink(book))
        }
        target='_blank'
        rel='noreferrer'
      >
        {link}
      </a>
    );
  };

  return (
    <>
      <strong>Najczęściej plusowane recenzje:</strong>
      <br />

      {top.map((review, index) => {
        const {matchedBook} = review;
        const author = matchedBook?.authors?.[0]?.name ?? review.author;

        return (
          <Fragment key={review.remoteId}>
            <br />

            {`${index + 1}. `}
            <strong>
              {`${review.upvotes} plusów`}
            </strong>

            {' - recenzja - '}

            <a
              href={review.url}
              target='_blank'
              rel='noreferrer'
            >
              <strong>
                {truncateText(
                  32,
                  `${matchedBook?.defaultTitle ?? review.defaultTitle} (${author})`,
                )}
              </strong>
            </a>

            {!R.isNil(review.rating) && ` - ${formatRatingStars(review.rating, 5)}`}
            {' - usera '}
            <strong>
              {review.reviewer}
            </strong>

            {matchedBook && (
              <>
                {' - '}
                {wrapWithBookLinkIfPresent(
                  matchedBook,
                  <strong>
                    więcej recenzji »
                  </strong>,
                )}
              </>
            )}
          </Fragment>
        );
      })}
    </>
  );
};
