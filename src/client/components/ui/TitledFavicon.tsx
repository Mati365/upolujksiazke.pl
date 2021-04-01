import React from 'react';
import c from 'classnames';

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
    {src && (
      <Favicon
        className='mr-2'
        src={src}
        title={title}
        alt='Logo'
      />
    )}
    {children}
  </Tag>
);

TitledFavicon.displayName = 'TitledFavicon';
