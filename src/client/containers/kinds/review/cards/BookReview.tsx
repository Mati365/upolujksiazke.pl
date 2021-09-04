import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import avatarPlaceholderUrl from '@assets/img/avatar-placeholder.png';
import {formatDate} from '@shared/helpers/format';

import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';

import {BookReviewRecord} from '@api/types';
import {RatingsRow} from '@client/containers/controls/RatingsRow';
import {TitledFavicon} from '@client/components/ui/TitledFavicon';
import {MessageAltIcon} from '@client/components/svg';
import {
  ExpandableDescriptionBox,
  UndecoratedLink,
  CleanList,
  Picture,
  Button,
  ExpandableDescriptionBoxProps,
} from '@client/components/ui';

import {truncateReviewerName} from '../helpers/truncateReviewerName';

import {BookThumbCard} from '../../book/cards/BookThumbCard';
import {WideBookCard} from '../../book/cards/WideBookCard';
import {BookReviewReactions} from '../controls/BookReviewReactions';

// eslint-disable-next-line max-len
const HIDDEN_PLACEHOLDER = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. <br /><br /> Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. <br /> It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';

export type BookReviewProps = {
  review: BookReviewRecord,
  showBookCard?: boolean,
  moreButtonRenderFn?: ExpandableDescriptionBoxProps['moreButtonRenderFn'],
  totalRatingStars?: number,
  maxCharacterCount?: number,
  showReactionsTitles?: boolean,
};

export const BookReview = (
  {
    review,
    showBookCard,
    moreButtonRenderFn,
    maxCharacterCount,
    showReactionsTitles = true,
    totalRatingStars = 10,
  }: BookReviewProps,
) => {
  const t = useI18n();
  const ua = useUA();
  const customMoreButton = !!moreButtonRenderFn;
  const {
    reviewer, description,
    rating, publishDate,
    url, website, book,
    quote,
  } = review;

  if (!description)
    return null;

  maxCharacterCount ??= ua.mobile ? 400 : 500;

  if (!customMoreButton && quote && url) {
    moreButtonRenderFn = () => (
      <UndecoratedLink
        href={review.url}
        target='_blank'
        rel='nofollow noreferrer'
        className='c-book-review__see-more c-promo-tag-link is-text-no-wrap ml-2'
        undecorated={false}
        withChevron
      >
        {t('book.reviews.read_full_review')}
      </UndecoratedLink>
    );
  }

  const bookCardVisible = showBookCard && book;
  return (
    <li
      id={`review-${review.id}`}
      className={c(
        'c-book-review',
        bookCardVisible && 'has-book-card',
        reviewer.hidden && 'has-blurred-content',
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
                {(
                  reviewer.hidden
                    ? truncateReviewerName(reviewer.name)
                    : reviewer.name
                )}
              </span>
            </li>

            {publishDate && (
              <li className='is-text-light-muted'>
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
          className='c-book-review__text'
          maxCharactersCount={maxCharacterCount}
          padding='small'
          quote={!!website}
          text={(
            reviewer.hidden
              ? HIDDEN_PLACEHOLDER
              : description
          )}
          moreButtonRenderFn={(
            !customMoreButton && reviewer.hidden
              ? R.F
              : moreButtonRenderFn
          )}
          filled
          html
        >
          {reviewer.hidden && website && (
            <div className='c-book-review__hidden-layer'>
              <Button
                className='is-text-semibold is-text-small has-double-link-chevron'
                type='primary'
                tag='a'
                href={url}
              >
                <MessageAltIcon className='mr-1' />
                {t('review.marked_as_hidden', [website.hostname])}
              </Button>
            </div>
          )}
        </ExpandableDescriptionBox>

        {website && (
          <div className='c-book-review__footer'>
            <BookReviewReactions
              reviewId={review.id}
              stats={review.stats}
              showTitles={showReactionsTitles}
            />

            <span className='c-book-review__more c-flex-row'>
              {!ua.mobile && `${t('review.read_more_at')}:`}
              <TitledFavicon
                tag='a'
                className='ml-2'
                href={url}
                src={website.logo.smallThumb?.file}
                title={website.hostname}
                target='_blank'
                rel='noopener noreferrer'
              />
            </span>
          </div>
        )}
      </div>
    </li>
  );
};

BookReview.displayName = 'BookReview';
