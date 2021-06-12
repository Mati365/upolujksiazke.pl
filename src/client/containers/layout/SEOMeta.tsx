import React from 'react';
import {Helmet} from 'react-helmet';

type SEOMetaProps = {
  meta: {
    title: string,
    description: string,
    cover?: string,
  },
};

export const SEOMeta = ({meta}: SEOMetaProps) => (
  <Helmet>
    <title>{meta.title}</title>
    <meta name='description' content={meta.description} />
    <meta property='og:title' content={meta.title} />
    <meta property='og:description' content={meta.description} />
    {meta.cover && (
      <meta property='og:image' content={meta.cover} />
    )}
  </Helmet>
);

SEOMeta.displayName = 'SEOMeta';
