import React from 'react';
import * as R from 'ramda';

import {DynamicIcon} from '@client/components/svg';
import {useI18n} from '@client/i18n';

import {CleanList, UndecoratedLink} from '@client/components/ui';
import {HomeLink} from '@client/routes/Links';

export type HeaderPromoLinksProps = {
  items: {
    icon?: any,
    name: string,
    href: string,
  }[],
};

export const HeaderPromoLinks = ({items}: HeaderPromoLinksProps) => {
  const t = useI18n();
  const [visible, rest] = R.splitAt(5, items);

  return (
    <CleanList
      className='c-header__promo'
      spaced={3}
      separated
      inline
    >
      {visible.map(
        ({name, href, icon}) => (
          <li key={name}>
            <UndecoratedLink
              href={href}
              className='c-header__promo-link'
              activeClassName='is-active'
            >
              <DynamicIcon
                icon={icon}
                className='c-header__promo-link-icon'
              />
              {name}
            </UndecoratedLink>
          </li>
        ),
      )}
      {!R.isEmpty(rest) && (
        <li>
          <HomeLink
            className='c-header__promo-link is-borderless is-primary-chevron-link is-text-semibold'
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
