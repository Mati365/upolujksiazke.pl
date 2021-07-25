import React from 'react';

type JsonLDProps = {
  json: object,
};

export const JsonLD = ({json}: JsonLDProps) => (
  <script
    type='application/ld+json'
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org/',
        ...json,
      }),
    }}
  />
);

JsonLD.displayName = 'JsonLD';
