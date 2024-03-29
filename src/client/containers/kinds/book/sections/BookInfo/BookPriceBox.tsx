import React, {ReactNode} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {buildURL} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {BookFullInfoRecord} from '@api/types';
import {PurchaseIcon} from '@client/components/svg/Icons';
import {BookCtaButton} from '@client/containers/kinds/book/controls/BookCtaButton';
import {BookPriceGroup} from './BookPriceGroup';

import {sortReleasesByPrice} from '../../helpers';

type BookPriceBoxProps = {
  book: BookFullInfoRecord,
  className?: string,
  small?: boolean,
  children?: ReactNode,
};

export const BookPriceBox = (
  {
    className,
    book,
    children,
    small,
  }: BookPriceBoxProps,
) => {
  const t = useI18n('book.price_box');
  const {
    lowestPrice,
    highestPrice,
  } = book;

  const isPromotion = highestPrice !== lowestPrice && highestPrice > 0;

  const onBuy = () => {
    const releases = sortReleasesByPrice(book.releases);

    window.open(
      buildURL(
        releases[0].availability[0].url,
        {
          utm_source: document.location.hostname,
          utm_medium: 'site',
          utm_campaign: 'primary button',
        },
      ),
      '_blank',
    );
  };

  const cta = (
    <BookCtaButton
      className='c-book-price-box__buy-cta'
      size={(
        small
          ? 'medium'
          : 'big'
      )}
      title={
        t('buy_cta')
      }
      disabled={
        R.isNil(highestPrice)
      }
      expanded={!small}
      onClick={onBuy}
    />
  );

  return (
    <div
      className={c(
        'c-book-price-box',
        small && 'is-small',
        className,
      )}
    >
      {!small && (
        <div className='c-book-price-box__header'>
          <PurchaseIcon className='mr-1' />
          {t('header')}
        </div>
      )}

      <div
        className={c(
          'c-book-price-box__price-wrapper',
          isPromotion && 'is-promotion',
        )}
      >
        <BookPriceGroup
          className='c-book-price-box__current-price'
          label={t('lowest_price')}
          value={lowestPrice}
        />

        {!small && isPromotion && (
          <BookPriceGroup
            className='c-book-price-box__prev-price'
            label={t('highest_price')}
            value={highestPrice}
          />
        )}

        {small && cta}
      </div>

      {!small && cta}
      {children}
    </div>
  );
};

BookPriceBox.displayName = 'BookPriceBox';
