import React from 'react';

import {JsonLD} from '@client/components/JsonLD';
import {prefixLinkWithHost} from '@client/routes/Links';

import type {BreadcrumbInfo} from '../controls/Breadcrumbs';

type BreadcrumbsJsonLDProps = {
  items: BreadcrumbInfo[],
};

export const BreadcrumbsJsonLD = ({items}: BreadcrumbsJsonLDProps) => (
  <JsonLD
    json={{
      '@type': 'BreadcrumbList',
      itemListElement: (
        items
          .map(({title, path}, index) => path && ({
            '@type': 'ListItem',
            position: index + 1,
            name: title,
            item: prefixLinkWithHost(path),
          }))
          .filter(Boolean)
      ),
    }}
  />
);

BreadcrumbsJsonLD.displayName = 'BreadcrumbsJsonLD';
