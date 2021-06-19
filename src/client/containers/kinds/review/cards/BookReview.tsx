import React from 'react';
import c from 'classnames';
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
  ExpandableDescriptionBoxProps,
} from '@client/components/ui';

import {BookThumbCard} from '../../book/cards/BookThumbCard';
import {WideBookCard} from '../../book/cards/WideBookCard';

export type BookReviewProps = {
  review: BookReviewRecord,
  showBookCard?: boolean,
  moreButtonRenderFn?: ExpandableDescriptionBoxProps['moreButtonRenderFn'],
  totalRatingStars?: number,
  maxCharacterCount?: number,
};

export const BookReview = (
  {
    review,
    showBookCard,
    moreButtonRenderFn,
    totalRatingStars = 10,
    maxCharacterCount = 500,
  }: BookReviewProps,
) => {
  const t = useI18n();
  const ua = useUA();
  const {
    reviewer, description,
    rating, publishDate,
    url, website, book,
  } = review;

  if (!description)
    return null;

  const bookCardVisible = showBookCard && book;
  return (
    <li
      id={`review-${review.id}`}
      className={c(
        'c-book-review',
        bookCardVisible && 'has-book-card',
      )}
    >
      {bookCardVisible && (
        ua.mobile
          ? (
            <WideBookCard
              item={book}
              className='c-book-review__book'
              withDescription={false}
              totalRatingStars={7}
            />
          )
          : (
            <BookThumbCard
              item={book}
              className='c-book-review__book'
            />
          )
      )}

      <div className='c-book-review__content'>
        <div className='c-book-review__toolbar'>
          <Picture
            className='c-book-review__user-avatar'
            src={(
              reviewer.avatar?.smallThumb?.file || avatarPlaceholderUrl
            )}
            alt='Avatar'
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
            <li>
              <span className='c-book-review__user-nick is-text-bold'>
                {reviewer.name}
              </span>
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
                totalStars={totalRatingStars}
                textOnly={ua.mobile}
                showTextValue
              />
            </div>
          )}
        </div>

        <ExpandableDescriptionBox
          className='c-book-review__text c-layer-box'
          maxCharactersCount={maxCharacterCount}
          padding='small'
          quote={!!website}
          text={description}
          justify={false}
          moreButtonRenderFn={moreButtonRenderFn}
          html
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
              target='_blank'
              rel='noopener noreferrer'
            />
          </div>
        )}
      </div>
    </li>
  );
};

BookReview.displayName = 'BookReview';
