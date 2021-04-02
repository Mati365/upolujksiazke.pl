import React from 'react';
import * as R from 'ramda';

import avatarPlaceholderUrl from '@assets/img/avatar-placeholder.jpg';

import {useI18n} from '@client/i18n';
import {formatDate} from '@shared/helpers/format';

import {BookReviewRecord} from '@api/types';
import {RatingsRow} from '@client/containers/parts/RatingsRow';
import {
  ExpandableDescriptionBox,
  CleanList,
  Picture,
} from '@client/components/ui';

type BookReviewProps = {
  review: BookReviewRecord,
};

export const BookReview = ({review}: BookReviewProps) => {
  const t = useI18n();
  const {reviewer, description, rating, publishDate} = review;

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
          <CleanList
            spaced={4}
            separated
            block
            inline
          >
            <li className='is-text-bold'>
              {reviewer.name}
            </li>

            {publishDate && (
              <li>
                {formatDate(publishDate)}
              </li>
            )}
          </CleanList>

          {!R.isNil(rating) && (
            <div className='c-flex-row'>
              {`${t('shared.titles.rating')}:`}
              <RatingsRow
                className='ml-2'
                value={rating / 10}
                totalStars={10}
              />
            </div>
          )}
        </div>

        <ExpandableDescriptionBox
          className='c-book-review__text c-layer-box'
          maxCharactersCount={350}
          text={description}
        />
      </div>
    </li>
  );
};

BookReview.displayName = 'BookReview';
