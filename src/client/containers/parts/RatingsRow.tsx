import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {toFixedIfFloating} from '@shared/helpers';

import {CleanList} from '@client/components/ui';
import {
  StarFilledIcon,
  StarHalfIcon,
  StarIcon,
} from '@client/components/svg/Stars';

function truncateNumber(max: number, number: number) {
  return (
    number > max
      ? `${max}+`
      : (number || 0)
  );
}

type RatingsRowProps = {
  className?: string,
  textOnly?: boolean,
  showTextValue?: boolean,
  totalStars?: number,
  totalRatings?: number,
  truncateRatingsCount?: number,
  size?: string,
  value: number,
};

export const RatingsRow = (
  {
    className,
    value,
    totalRatings,
    textOnly,
    showTextValue,
    truncateRatingsCount = 999,
    size = 'normal',
    totalStars = 5,
  }: RatingsRowProps,
) => {
  const t = useI18n();

  const normalizedValue = value * totalStars;
  const stars = !textOnly && R.times(
    (score) => {
      let Component = StarIcon;
      let starClassName = null;

      if (normalizedValue > 0) {
        if (score === Math.floor(normalizedValue) && score !== normalizedValue) {
          Component = StarHalfIcon;
          starClassName = 'is-half';
        } else if (score < normalizedValue) {
          Component = StarFilledIcon;
          starClassName = 'is-filled';
        }
      }

      return (
        <Component
          key={score}
          className={c(
            'c-ratings-row__star',
            starClassName || 'is-empty',
          )}
        />
      );
    },
    totalStars,
  );

  const ratingsTitle = (
    R.isNil(totalRatings)
      ? null
      : truncateNumber(truncateRatingsCount, totalRatings)
  );

  return (
    <CleanList
      tag='div'
      className={c(
        'c-ratings-row is-inline',
        size && `is-text-${size}`,
        className,
      )}
    >
      {stars}
      {(textOnly || showTextValue) && (
        <span className='c-ratings-row__text-value'>
          {`${toFixedIfFloating(normalizedValue, 1)} / ${totalStars}`}
        </span>
      )}
      {ratingsTitle !== null && (
        <span className='c-ratings-row__total'>
          {`(${ratingsTitle} ${t('shared.book.total_ratings')})`}
        </span>
      )}
    </CleanList>
  );
};

RatingsRow.displayName = 'RatingsRow';
