import React from 'react';
import c from 'classnames';

import {Button, ButtonProps} from '@client/components/ui';
import {
  BasketIcon,
  ChevronRightIcon,
} from '@client/components/svg';

type BookCtaButtonProps = ButtonProps & {
  title: string,
};

export const BookCtaButton = ({title, className, children, ...props}: BookCtaButtonProps) => (
  <Button
    className={c(
      'c-book-cta',
      className,
    )}
    type='primary'
    size='medium-small'
    aria-label={title}
    iconSuffix
    {...props}
  >
    <BasketIcon className='c-book-cta__prefix-icon' />
    {title}
    {children}
    <ChevronRightIcon />
  </Button>
);

BookCtaButton.displayName = 'BookCtaButton';
