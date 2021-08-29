import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';
import {
  QuoteEndIcon,
  QuoteStartIcon,
} from '../svg';

export type DescriptionBoxProps = BasicWrapperProps & {
  justify?: boolean,
  padding?: string,
  quote?: boolean,
  mobileSmaller?: boolean,
  filled?: boolean,
};

export const DescriptionBox = (
  {
    children,
    className,
    padding,
    quote,
    filled,
    mobileSmaller = true,
    justify = true,
  }: DescriptionBoxProps,
) => (
  <div
    className={c(
      'c-description-box',
      mobileSmaller && 'is-mobile-smaller',
      justify && 'is-text-justify',
      quote && 'is-quote',
      filled && 'is-filled',
      padding && `has-${padding}-padding`,
      className,
    )}
  >
    {quote && (
      <QuoteStartIcon className='c-description-box__quote is-start' />
    )}
    {children}
    {quote && (
      <QuoteEndIcon className='c-description-box__quote is-end' />
    )}
  </div>
);

DescriptionBox.displayName = 'DescriptionBox';
