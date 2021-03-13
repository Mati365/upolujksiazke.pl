import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {CleanList} from '@client/components/ui';
import {
  StarFilledIcon,
  StarHalfIcon,
  StarIcon,
} from '@client/components/svg/Stars';

type RatingsRowProps = {
  className?: string,
  totalStars?: number,
  totalReviews?: number,
  size?: string,
  value: number,
};

export const RatingsRow = (
  {
    className,
    value,
    totalReviews,
    size = 'normal',
    totalStars = 5,
  }: RatingsRowProps,
) => {
  const normalizedValue = value * totalStars;
  const stars = R.times(
    (score) => {
      let Component = StarIcon;
      let starClassName = null;

      if (normalizedValue > 0) {
        if (score <= normalizedValue) {
          Component = StarFilledIcon;
          starClassName = 'is-filled';
        } else if (score === Math.floor(normalizedValue) && score !== normalizedValue) {
          Component = StarHalfIcon;
          starClassName = 'is-half';
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

  return (
    <CleanList
      className={c(
        'c-ratings-row is-inline',
        size && `is-text-${size}`,
        className,
      )}
    >
      {stars}
      {totalReviews > 0 && (
        <span className='c-ratings-row__total'>
          {`(${totalReviews})`}
        </span>
      )}
    </CleanList>
  );
};

RatingsRow.displayName = 'RatingsRow';
