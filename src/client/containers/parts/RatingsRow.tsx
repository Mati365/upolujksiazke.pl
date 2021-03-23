import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {CleanList} from '@client/components/ui';
import {
  StarFilledIcon,
  StarHalfIcon,
  StarIcon,
} from '@client/components/svg/Stars';

type RatingsRowProps = {
  className?: string,
  totalStars?: number,
  totalRatings?: number,
  size?: string,
  value: number,
};

export const RatingsRow = (
  {
    className,
    value,
    totalRatings,
    size = 'normal',
    totalStars = 5,
  }: RatingsRowProps,
) => {
  const t = useI18n();

  const normalizedValue = value * totalStars;
  const stars = R.times(
    (score) => {
      let Component = StarIcon;
      let starClassName = null;

      if (normalizedValue > 0) {
        if (score === Math.floor(normalizedValue) && score !== normalizedValue) {
          Component = StarHalfIcon;
          starClassName = 'is-half';
        } else if (score <= normalizedValue) {
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

  return (
    <CleanList
      className={c(
        'c-ratings-row is-inline',
        size && `is-text-${size}`,
        className,
      )}
    >
      {stars}
      {!R.isNil(totalRatings) && (
        <span className='c-ratings-row__total'>
          {`(${totalRatings || 0} ${t('shared.book.total_ratings')})`}
        </span>
      )}
    </CleanList>
  );
};

RatingsRow.displayName = 'RatingsRow';
