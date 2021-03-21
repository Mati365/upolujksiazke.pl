import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {normalizeFloatingNumber} from '@client/helpers/logic';

type PriceProps = JSX.IntrinsicElements['span'] & {
  tag?: any,
  value: number,
  currency?: string,
};

export const Price = (
  {
    className,
    value,
    tag: Tag = 'span',
    currency = 'pln',
    ...props
  }: PriceProps,
) => {
  const t = useI18n();
  const blank = R.isNil(value);

  return (
    <Tag
      {...props}
      className={c(
        'c-price',
        blank && 'is-blank',
        className,
      )}
    >
      {(
        blank
          ? t('shared.titles.no_data')
          : `${normalizeFloatingNumber(value)} ${t(`shared.price.${currency}`)}`
      )}
    </Tag>
  );
};

Price.displayName = 'Price';
