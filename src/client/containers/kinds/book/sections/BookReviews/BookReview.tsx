import React from 'react';
import * as R from 'ramda';

import avatarPlaceholderUrl from '@assets/img/avatar-placeholder.jpg';
import {formatDate} from '@shared/helpers/format';

import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';

import {BookReviewRecord} from '@api/types';
import {RatingsRow} from '@client/containers/parts/RatingsRow';
import {TitledFavicon} from '@client/components/ui/TitledFavicon';
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
  const ua = useUA();
  const {
    reviewer, description,
    rating, publishDate,
    url, website,
  } = review;

  if (!description)
    return null;

  return (
    <li className='c-book-review'>
      <div className='c-book-review__toolbar'>
        <Picture
          className='c-book-review__user-avatar'
          src={(
            reviewer.avatar?.smallThumb?.file || avatarPlaceholderUrl
          )}
        />

        <CleanList
          className='c-book-review__user-info'
          block
          {...(
            ua.mobile
              ? {
                inline: false,
                spaced: 1,
              }
              : {
                separated: true,
                inline: true,
                spaced: 4,
              }
          )}
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
          <div className='c-book-review__user-rating c-flex-row ml-auto'>
            {`${t('shared.titles.rating')}:`}
            <RatingsRow
              className='ml-2'
              value={rating / 10}
              totalStars={10}
              textOnly={ua.mobile}
              showTextValue
            />
          </div>
        )}
      </div>

      <ExpandableDescriptionBox
        className='c-book-review__text c-layer-box'
        maxCharactersCount={350}
        padding='small'
        quote={!!website}
        text={description}
      />

      {website && (
        <div className='c-book-review__footer c-flex-row'>
          {`${t('review.read_more_at')}:`}
          <TitledFavicon
            tag='a'
            className='ml-2'
            href={url}
            src={website.logo.smallThumb?.file}
            title={website.hostname}
          />
        </div>
      )}
    </li>
  );
};

BookReview.displayName = 'BookReview';
