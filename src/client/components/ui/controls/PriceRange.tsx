import React from 'react';
import c from 'classnames';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';

import {MinMaxRange} from '@shared/types';
import {Input} from './Input';

type PriceRangeProps = LinkProps<MinMaxRange> & {
  className?: string,
};

export const PriceRange = linkInputs<MinMaxRange>(
  {
    initialData: {},
  },
)((
  {
    l,
    className,
  }: PriceRangeProps,
) => (
  <div
    className={c(
      'c-price-range',
      className,
    )}
  >
    <Input
      {...l.input(
        'min',
        {
          deleteFromParentIf: (inputValue) => !inputValue,
        },
      )}
      placeholder='min zł'
      type='number'
    />
    <span className='c-price-range__separator'>
      -
    </span>
    <Input
      {...l.input(
        'max',
        {
          deleteFromParentIf: (inputValue) => !inputValue,
        },
      )}
      placeholder='max zł'
      type='number'
    />
  </div>
));

PriceRange.displayName = 'PriceRange';
