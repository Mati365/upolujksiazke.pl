import React from 'react';

import {ENV} from '@client/constants/env';
import {useI18n} from '@client/i18n';

import {
  HomeLink,
  HOME_PATH,
  CATEGORIES_PATH,
  AUTHORS_PATH,
  BOOK_SERIES_PATH,
  TAGS_PATH,
  TOP_BOOKS_PATH,
} from '@client/routes/Links';

import {CleanList, Container, UndecoratedLink} from '@client/components/ui';
import {
  WebsiteLogoIcon,
  HomeIcon,
  TrophyIcon,
  BookIcon,
  TagIcon,
  GroupIcon,
  CategoryIcon,
} from '@client/components/svg/Icons';

export const Header = () => {
  const t = useI18n();
  const links: [any, string, string][] = [
    [HomeIcon, HOME_PATH, null],
    [CategoryIcon, CATEGORIES_PATH, t('links.categories')],
    [GroupIcon, AUTHORS_PATH, t('links.authors')],
    [BookIcon, BOOK_SERIES_PATH, t('links.series')],
    [TagIcon, TAGS_PATH, t('links.tags')],
    [TrophyIcon, TOP_BOOKS_PATH, t('links.top')],
  ];

  return (
    <header className='c-header'>
      <Container className='c-flex-row'>
        <HomeLink className='c-header__brand'>
          <WebsiteLogoIcon />
          <span className='c-header__brand-title'>
            {ENV.shared.website.name}
          </span>
        </HomeLink>

        <CleanList
          className='c-header__toolbar'
          spaced={6}
          inline
          separated
        >
          {links.map(
            ([Icon, url, title]) => (
              <li
                key={title}
                className='c-header__link'
              >
                <UndecoratedLink href={url}>
                  <Icon className='c-header__link-icon' />
                  {title && (
                    <span className='c-header__link-text'>
                      {title}
                    </span>
                  )}
                </UndecoratedLink>
              </li>
            ),
          )}
        </CleanList>
      </Container>
    </header>
  );
};

Header.displayName = 'Header';
