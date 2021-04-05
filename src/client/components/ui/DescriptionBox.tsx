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
};

export const DescriptionBox = (
  {
    children,
    className,
    padding,
    quote,
    justify = true,
  }: DescriptionBoxProps,
) => (
  <div
    className={c(
      'c-description-box',
      justify && 'is-text-justify',
      quote && 'is-quote',
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
