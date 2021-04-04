import React from 'react';
import c from 'classnames';

import noImagePlaceholderUrl from '@assets/img/no-image-placeholder.png';
import {Favicon} from './Favicon';

type TitledFaviconProps = JSX.IntrinsicElements['span'] & {
  src: string,
  title?: string,
  tag?: any,
};

export const TitledFavicon = (
  {
    src, title, children, className,
    tag: Tag = 'span',
    ...props
  }: TitledFaviconProps,
) => (
  <Tag
    className={c(
      'c-flex-row is-text-semibold',
      className,
    )}
    {...props}
  >
    <Favicon
      className='mr-2'
      src={src || noImagePlaceholderUrl}
      title={title}
      alt='Logo'
    />
    {children}
  </Tag>
);

TitledFavicon.displayName = 'TitledFavicon';
