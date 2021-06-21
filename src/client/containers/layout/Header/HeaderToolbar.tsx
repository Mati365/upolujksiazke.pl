import React from 'react';

import {useI18n} from '@client/i18n';

import {
  genAuthorsLink,
  HOME_PATH,
  BOOKS_PATH,
  TOP_BOOKS_PATH,
  NEWS_PATH,
  BOOKS_REVIEWS_PATH,
} from '@client/routes/Links';

import {CleanList, UndecoratedLink} from '@client/components/ui';
import {
  HomeIcon,
  TrophyIcon,
  GroupIcon,
  CategoryIcon,
  NewsIcon,
  CommentIcon,
} from '@client/components/svg/Icons';

export const HeaderToolbar = () => {
  const t = useI18n();
  const links: [any, string, string, boolean?][] = [
    [HomeIcon, HOME_PATH, t('links.home'), true],
    [CategoryIcon, BOOKS_PATH, t('links.books')],
    [TrophyIcon, TOP_BOOKS_PATH, t('links.top')],
    [CommentIcon, BOOKS_REVIEWS_PATH, t('links.reviews')],
    [GroupIcon, genAuthorsLink(), t('links.authors')],
    [NewsIcon, NEWS_PATH, t('links.news')],
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
