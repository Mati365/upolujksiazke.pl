import React from 'react';

import {ENV} from '@client/constants/env';
import {BOOKS_PATH} from '@client/routes/Links';

import {concatUrls} from '@shared/helpers/concatUrls';
import {JsonLD} from '@client/components/JsonLD';

const ROOT_URL = ENV.shared.website.url;

export const SearchJsonLD = () => (
  <JsonLD
    json={{
      '@type': 'WebSite',
      url: ROOT_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${concatUrls(ROOT_URL, BOOKS_PATH)}?phrase={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }}
  />
);

SearchJsonLD.displayName = 'SearchJsonLD';
