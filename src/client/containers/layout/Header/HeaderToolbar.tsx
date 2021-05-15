import React from 'react';

import {useI18n} from '@client/i18n';

import {
  genAuthorsLink,
  HOME_PATH,
  BOOKS_PATH,
  BOOK_SERIES_PATH,
  TAGS_PATH,
  TOP_BOOKS_PATH,
} from '@client/routes/Links';

import {CleanList, UndecoratedLink} from '@client/components/ui';
import {
  HomeIcon,
  TrophyIcon,
  BookIcon,
  TagIcon,
  GroupIcon,
  CategoryIcon,
} from '@client/components/svg/Icons';

export const HeaderToolbar = () => {
  const t = useI18n();
  const links: [any, string, string][] = [
    [HomeIcon, HOME_PATH, null],
    [CategoryIcon, BOOKS_PATH, t('links.books')],
    [TrophyIcon, TOP_BOOKS_PATH, t('links.top')],
    [BookIcon, BOOK_SERIES_PATH, t('links.series')],
    [GroupIcon, genAuthorsLink(), t('links.authors')],
    [TagIcon, TAGS_PATH, t('links.tags')],
  ];

  return (
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
            <UndecoratedLink
              href={url}
              activeClassName='is-active'
            >
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
  );
};

HeaderToolbar.displayName = 'HeaderToolbar';
