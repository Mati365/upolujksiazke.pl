import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {normalizeFloatingNumber} from '@client/helpers/logic';

type PriceProps = JSX.IntrinsicElements['span'] & {
  value: number,
  currency?: string,
};

export const Price = ({value, currency = 'pln', ...props}: PriceProps) => {
  const t = useI18n();
  if (R.isNil(value))
    return null;

  return (
    <span {...props}>
      {`${normalizeFloatingNumber(value)} ${t(`shared.price.${currency}`)}`}
    </span>
  );
};

Price.displayName = 'Price';
