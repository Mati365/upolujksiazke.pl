import React from 'react';

import {useI18n} from '@client/i18n';

import {
  HOME_PATH,
  CATEGORIES_PATH,
  AUTHORS_PATH,
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
    [CategoryIcon, CATEGORIES_PATH, t('links.categories')],
    [GroupIcon, AUTHORS_PATH, t('links.authors')],
    [BookIcon, BOOK_SERIES_PATH, t('links.series')],
    [TagIcon, TAGS_PATH, t('links.tags')],
    [TrophyIcon, TOP_BOOKS_PATH, t('links.top')],
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
  );
};

HeaderToolbar.displayName = 'HeaderToolbar';
