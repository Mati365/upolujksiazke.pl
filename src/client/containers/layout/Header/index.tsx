import React from 'react';

import {ENV} from '@client/constants/env';

import {HomeLink} from '@client/routes/Links';
import {Container} from '@client/components/ui';
import {WebsiteLogoIcon} from '@client/components/svg/Icons';
import {HeaderToolbar} from './HeaderToolbar';

export const Header = () => (
  <header className='c-header'>
    <Container className='c-flex-row'>
      <HomeLink className='c-header__brand'>
        <WebsiteLogoIcon />
        <span className='c-header__brand-title'>
          {ENV.shared.website.name}
        </span>
      </HomeLink>

      <HeaderToolbar />
    </Container>
  </header>
);

Header.displayName = 'Header';
