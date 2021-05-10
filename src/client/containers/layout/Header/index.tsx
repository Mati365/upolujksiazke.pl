import React from 'react';
import c from 'classnames';

import {ENV} from '@client/constants/env';
import {useUA} from '@client/modules/ua';

import {HomeLink} from '@client/routes/Links';
import {Container} from '@client/components/ui';
import {WebsiteLogoIcon} from '@client/components/svg/Icons';
import {HeaderToolbar} from './HeaderToolbar';
import {HeaderPromoLinks, HeaderPromoLinksProps} from './HeaderPromoLinks';
import {HeaderSearch} from './HeaderSearch';

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
        <HomeLink
          hoverUnderline={false}
          className={c(
            'c-header__brand',
            ua.mobile && 'mx-auto',
          )}
        >
          <WebsiteLogoIcon />
          <span className='c-header__brand-title'>
            {ENV.shared.website.name}
          </span>
        </HomeLink>

        {!ua.mobile && [
          <HeaderSearch key='search' />,
          <HeaderToolbar key='toolbar' />,
        ]}
      </Container>

      {hasPromoBar && (
        <Container>
          <HeaderPromoLinks items={promoItems} />
        </Container>
      )}
    </header>
  );
};

Header.displayName = 'Header';
