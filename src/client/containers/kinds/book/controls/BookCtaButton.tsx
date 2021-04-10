import React from 'react';
import c from 'classnames';

import {Button, ButtonProps} from '@client/components/ui';
import {
  BasketIcon,
  ChevronRightIcon,
} from '@client/components/svg';

type BookCtaButtonProps = ButtonProps & {
  title: string,
  href?: string,
};

export const BookCtaButton = ({href, title, className, children, ...props}: BookCtaButtonProps) => (
  <Button
    className={c(
      'c-book-cta',
      className,
    )}
    size='medium-small'
    aria-label={title}
    iconSuffix
    {...!props.disabled && {
      type: 'primary',
    }}
    {...props}
  >
    <BasketIcon className='c-book-cta__prefix-icon' />
    <span className='c-book-cta__title'>
      {title}
    </span>
    {children}
    <ChevronRightIcon />
  </Button>
);

BookCtaButton.displayName = 'BookCtaButton';
