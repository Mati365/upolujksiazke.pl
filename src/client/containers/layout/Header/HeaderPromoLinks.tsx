import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {CleanList, UndecoratedLink} from '@client/components/ui';
import {HomeLink} from '@client/routes/Links';

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

export const HeaderPromoLinks = ({items}: HeaderPromoLinksProps) => {
  const t = useI18n();
  const [visible, rest] = R.splitAt(6, items);

  return (
    <CleanList
      className='c-header__promo'
      spaced={2}
      inline
    >
      {visible.map(
        ({name, href}, index) => (
          <li
            key={name}
            className='c-header__promo-link'
            style={{
              borderBottomColor: PROMO_COLORS[index % PROMO_COLORS.length],
            }}
          >
            <UndecoratedLink
              href={href}
              activeClassName='is-active'
            >
              {name}
            </UndecoratedLink>
          </li>
        ),
      )}
      {!R.isEmpty(rest) && (
        <li className='c-header__promo-link is-borderless'>
          <HomeLink
            className='is-primary-chevron-link is-text-semibold'
            undecorated={false}
            underline={false}
          >
            {`${t('shared.titles.more')} (${rest.length})`}
          </HomeLink>
        </li>
      )}
    </CleanList>
  );
};

HeaderPromoLinks.displayName = 'HeaderPromoLinks';
