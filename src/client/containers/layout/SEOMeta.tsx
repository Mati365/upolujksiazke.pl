import React from 'react';
import {useLocation} from 'react-router';
import {Helmet} from 'react-helmet';

import {prefixLinkWithHost} from '@client/routes/Links';
import {Size} from '@shared/types';

type SEOMetaProps = {
  meta: {
    title: string,
    description: string,
    cover?: {
      url: string,
      size?: Size,
    },
  },
};

export const SEOMeta = ({meta: {title, description, cover}}: SEOMetaProps) => {
  const {pathname} = useLocation();
  const url = prefixLinkWithHost(pathname);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:url' content={url} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      {cover && [
        <meta
          key='twitter:image'
          property='twitter:image'
          content={cover.url}
        />,
        <meta
          key='og:image'
          property='og:image'
          content={cover.url}
        />,
        <meta
          key='og:image:url'
          property='og:image:url'
          content={cover.url}
        />,
        ...!cover.size ? [] : [
          <meta
            key='og:image:width'
            property='og:image:width'
            content={cover.size.w.toString()}
          />,
          <meta
            key='og:image:height'
            property='og:image:height'
            content={cover.size.h.toString()}
          />,
        ],
      ]}
    </Helmet>
  );
};

SEOMeta.displayName = 'SEOMeta';
