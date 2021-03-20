import React from 'react';
import c from 'classnames';

import {Price} from '@client/containers/Price';

type BookPriceGroupProps = {
  className?: string,
  label: string,
  value: number,
};

export const BookPriceGroup = ({label, value, className}: BookPriceGroupProps) => (
  <div
    className={c(
      'c-book-price-group',
      className,
    )}
  >
    <div className='c-book-price-group__label'>
      {label}
    </div>
    <Price
      className='c-book-price-group__value'
      value={value}
      tag='div'
    />
  </div>
);

BookPriceGroup.displayName = 'BookPriceGroup';
