import React from 'react';
import c from 'classnames';

import {ENV} from '@client/constants/env';
import {useUA} from '@client/modules/ua';

import {HomeLink} from '@client/routes/Links';
import {Container} from '@client/components/ui';
import {WebsiteLogoIcon} from '@client/components/svg/Icons';
import {HeaderToolbar} from './HeaderToolbar';
import {HeaderPromoLinks, HeaderPromoLinksProps} from './HeaderPromoLinks';

export type HeaderProps = {
  promoItems?: HeaderPromoLinksProps['items'],
};

export const Header = ({promoItems}: HeaderProps) => {
  const ua = useUA();
  const hasPromoBar = !ua.mobile && promoItems?.length > 0;

  return (
    <header
      className={c(
        'c-header',
        hasPromoBar && 'has-promo-bar',
      )}
    >
      <Container className='c-flex-row'>
        <HomeLink className='c-header__brand'>
          <WebsiteLogoIcon />
          <span className='c-header__brand-title'>
            {ENV.shared.website.name}
          </span>
        </HomeLink>

        <HeaderToolbar />
      </Container>

      {hasPromoBar && (
        <HeaderPromoLinks items={promoItems} />
      )}
    </header>
  );
};

Header.displayName = 'Header';
