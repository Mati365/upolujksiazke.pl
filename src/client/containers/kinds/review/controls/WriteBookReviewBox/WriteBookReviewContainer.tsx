import React from 'react';

import {useAjaxAPIClient} from '@client/modules/api/client/hooks/useAjaxAPIClient';
import {WriteBookReviewBox} from './WriteBookReviewBox';

type WriteBookReviewContainerProps = {
  bookId: number;
};

export const WriteBookReviewContainer = ({bookId}: WriteBookReviewContainerProps) => {
  const {repo} = useAjaxAPIClient();

  return (
    <WriteBookReviewBox
      onSubmit={
        (review) => repo.booksReviews.addBookReview(
          {
            ...review,
            bookId,
          },
        )
      }
    />
  );
};

WriteBookReviewContainer.displayName = 'WriteBookReviewContainer';
