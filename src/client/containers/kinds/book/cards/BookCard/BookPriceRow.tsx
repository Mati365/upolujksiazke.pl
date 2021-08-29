import React from 'react';

import {useI18n} from '@client/i18n';
import {Price} from '@client/containers/Price';

type BookPriceRowProps = {
  lowestPrice: number,
  highestPrice?: number,
};

export const BookPriceRow = ({lowestPrice, highestPrice}: BookPriceRowProps) => {
  const t = useI18n();

  return (
    <div className='c-book-card__price'>
      <span className='is-text-muted is-text-small'>
        {`${t('shared.book.price')}:`}
      </span>

      <Price
        className='ml-1 is-text-primary is-text-semibold'
        value={lowestPrice}
      />

      {highestPrice > 0 && highestPrice !== lowestPrice && (
        <Price
          className='ml-1 is-text-muted is-text-strike is-text-small'
          value={highestPrice}
        />
      )}
    </div>
  );
};

BookPriceRow.displayName = 'BookPriceRow';
