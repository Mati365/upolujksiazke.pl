import React from 'react';

import avatarPlaceholderUrl from '@assets/img/avatar-placeholder.jpg';

import {BookReviewRecord} from '@api/types';
import {
  ExpandableDescriptionBox,
  Picture,
} from '@client/components/ui';

type BookReviewProps = {
  review: BookReviewRecord,
};

export const BookReview = ({review}: BookReviewProps) => {
  const {reviewer, description} = review;
  if (!description)
    return null;

  return (
    <li className='c-book-review'>
      <div className='c-book-review__user'>
        <Picture
          src={(
            reviewer.avatar?.smallThumb?.file || avatarPlaceholderUrl
          )}
          className='c-book-review__user-avatar'
        />
      </div>

      <div className='c-book-review__content'>
        <div className='c-book-review__toolbar'>
          <strong>
            {reviewer.name}
          </strong>
        </div>

        <ExpandableDescriptionBox
          maxCharactersCount={350}
          text={description}
        />
      </div>
    </li>
  );
};

BookReview.displayName = 'BookReview';
