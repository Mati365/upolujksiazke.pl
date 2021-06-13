import React from 'react';

import {useI18n} from '@client/i18n';

import {
  genAuthorsLink,
  HOME_PATH,
  BOOKS_PATH,
  BOOK_SERIES_PATH,
  TOP_BOOKS_PATH,
  NEWS_PATH,
} from '@client/routes/Links';

import {CleanList, UndecoratedLink} from '@client/components/ui';
import {
  HomeIcon,
  TrophyIcon,
  BookIcon,
  GroupIcon,
  CategoryIcon,
  NewsIcon,
} from '@client/components/svg/Icons';

export const HeaderToolbar = () => {
  const t = useI18n();
  const links: [any, string, string, boolean?][] = [
    [HomeIcon, HOME_PATH, t('links.home'), true],
    [NewsIcon, NEWS_PATH, t('links.news')],
    [CategoryIcon, BOOKS_PATH, t('links.books')],
    [TrophyIcon, TOP_BOOKS_PATH, t('links.top')],
    [BookIcon, BOOK_SERIES_PATH, t('links.series')],
    [GroupIcon, genAuthorsLink(), t('links.authors')],
  ];

  return (
    <CleanList
      className='c-header__toolbar'
      spaced={6}
      inline
      separated
    >
      {links.map(
        ([Icon, url, title, onlyIcon]) => (
          <li
            key={title}
            className='c-header__link'
          >
            <UndecoratedLink
              href={url}
              title={title}
              activeClassName='is-active'
            >
              <Icon className='c-header__link-icon' />
              {!onlyIcon && title && (
                <span className='c-header__link-text'>
                  {title}
                </span>
              )}
            </UndecoratedLink>
          </li>
        ),
      )}
    </CleanList>
  );
};

HeaderToolbar.displayName = 'HeaderToolbar';
