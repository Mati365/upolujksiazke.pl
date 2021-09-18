import React from 'react';
import c from 'classnames';

import noImagePlaceholderUrl from '@assets/img/no-image-placeholder.png';
import {Favicon} from './Favicon';

type TitledFaviconProps = JSX.IntrinsicElements['span'] & {
  src: string,
  bold?: boolean,
  centered?: boolean,
  title?: string,
  tag?: any,
  href?: string,
  rel?: string,
  target?: string,
};

export const TitledFavicon = (
  {
    src, title, children, className,
    centered, bold = true,
    tag: Tag = 'span',
    ...props
  }: TitledFaviconProps,
) => {
  const faviconTitle = children || title;

  return (
    <Tag
      className={c(
        'c-titled-favicon c-flex-row',
        bold && 'is-text-semibold',
        centered && 'is-centered',
        Tag === 'a' && (
          'is-undecorated-link has-hover-underline has-double-link-chevron'
        ),
        className,
      )}
      {...props}
    >
      <Favicon
        src={src || noImagePlaceholderUrl}
        title={title || undefined}
        alt='Logo'
      />

      {!!faviconTitle && (
        <span className='c-titled-favicon__title'>
          {faviconTitle}
        </span>
      )}
    </Tag>
  );
};

TitledFavicon.displayName = 'TitledFavicon';
