import React from 'react';
import c from 'classnames';

import {ENV} from '@client/constants/env';

import {useUA} from '@client/modules/ua';

import {BookCategoryRecord} from '@api/types';
import {HomeLink, genBookCategoryLink} from '@client/routes/Links';
import {Container} from '@client/components/ui';
import {WebsiteLogoIcon} from '@client/components/svg/Icons';
import {HeaderSearch} from '@client/containers/kinds/search/controls/HeaderSearch';
import {HeaderToolbar} from './HeaderToolbar';
import {HeaderPromoLinks, HeaderPromoLinksProps} from './HeaderPromoLinks';
import {MobileMenu} from '../MobileMenu';

export type HeaderProps = {
  promoItems?: HeaderPromoLinksProps['items'],
  hidePromoBar?: boolean,
  popularCategories?: BookCategoryRecord[],
};

export const Header = ({hidePromoBar, popularCategories}: HeaderProps) => {
  const ua = useUA();
  const promoItems = !ua.mobile && !hidePromoBar && popularCategories?.map(
    (category) => ({
      icon: category.icon,
      name: category.name,
      href: genBookCategoryLink(category),
    }),
  );

  const promoBarVisible = !hidePromoBar && promoItems?.length > 0;

  return (
    <header
      className={c(
        'c-header',
        promoBarVisible && 'has-promo-bar',
      )}
    >
      <Container
        className={(
          ua.mobile
            ? 'c-flex-column'
            : 'c-flex-row'
        )}
      >
        <HomeLink
          className='c-header__brand'
          hoverUnderline={false}
        >
          <WebsiteLogoIcon />
          <span className='c-header__brand-title'>
            {ENV.shared.website.name}
          </span>
        </HomeLink>

        {!ua.mobile && (
          <>
            <HeaderSearch />
            <HeaderToolbar />
          </>
        )}
      </Container>

      {ua.mobile && (
        <Container>
          <HeaderSearch />
          <MobileMenu />
        </Container>
      )}

      {promoBarVisible && (
        <Container expandable>
          <HeaderPromoLinks items={promoItems} />
        </Container>
      )}
    </header>
  );
};

Header.displayName = 'Header';
