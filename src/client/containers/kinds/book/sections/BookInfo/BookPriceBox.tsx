import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {PurchaseIcon} from '@client/components/svg/Icons';
import {BookFullInfoRecord} from '@api/types';
import {BookCtaButton} from '@client/containers/controls/BookCtaButton';
import {BookPriceGroup} from './BookPriceGroup';

type BookPriceBoxProps = {
  className?: string,
  book: BookFullInfoRecord,
};

export const BookPriceBox = ({className, book}: BookPriceBoxProps) => {
  const t = useI18n('book.price_box');
  const isPromotion = book.highestPrice !== book.lowestPrice;

  return (
    <div
      className={c(
        'c-book-price-box',
        className,
      )}
    >
      <div className='c-book-price-box__header'>
        <PurchaseIcon className='mr-1' />
        {t('header')}
      </div>

      <div
        className={c(
          'c-book-price-box__price-wrapper',
          isPromotion && 'is-promotion',
        )}
      >
        <BookPriceGroup
          className='c-book-price-box__current-price'
          label={t('lowest_price')}
          value={book.lowestPrice}
        />

        {isPromotion && (
          <BookPriceGroup
            className='c-book-price-box__prev-price'
            label={t('highest_price')}
            value={book.highestPrice}
          />
        )}
      </div>

      <BookCtaButton
        className='c-book-price-box__buy-cta'
        size='big'
        title={
          t('buy_cta')
        }
        disabled={
          R.isNil(book.highestPrice)
        }
        expanded
      />
    </div>
  );
};

BookPriceBox.displayName = 'BookPriceBox';
