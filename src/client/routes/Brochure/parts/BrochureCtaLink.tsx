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
  rel?: string,
  target?: string,
};

export const BrochureCtaLink = ({title, className, children, ...props}: BookCtaButtonProps) => (
  <Button
    tag='a'
    target='_blank'
    rel='nofollow noreferrer'
    className={c(
      'c-brochure-cta',
      className,
    )}
    size='medium'
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

BrochureCtaLink.displayName = 'BrochureCtaLink';
