import React from 'react';
import {CleanList, UndecoratedLink} from '@client/components/ui';

/**
 * @see {@link https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51}
 */
const PROMO_COLORS = [
  '#d90429',
  '#264653',
  '#2a9d8f',
  '#e9c46a',
  '#9ed55b',
  '#f4a261',
  '#e76f51',
  '#1b998b',
  '#0899ba',
];

export type HeaderPromoLinksProps = {
  items: {
    name: string,
    href: string,
  }[],
};

export const HeaderPromoLinks = ({items}: HeaderPromoLinksProps) => (
  <CleanList
    className='c-header__promo'
    justify='center'
    spaced={2}
    inline
  >
    {items.map(
      ({name, href}, index) => (
        <li
          key={name}
          className='c-header__promo-link'
          style={{
            borderBottomColor: PROMO_COLORS[index % PROMO_COLORS.length],
          }}
        >
          <UndecoratedLink href={href}>
            {name}
          </UndecoratedLink>
        </li>
      ),
    )}
  </CleanList>
);

HeaderPromoLinks.displayName = 'HeaderPromoLinks';
