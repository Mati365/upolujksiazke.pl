import React from 'react';

import {
  BOOKS_PATH,
  HOME_PATH,
  NEWS_PATH,
  TOP_BOOKS_PATH,
  BOOKS_REVIEWS_PATH,
} from '@client/routes/Links';

import {useI18n} from '@client/i18n';

import {
  TrophyIcon,
  HomeIcon,
  BookIcon,
  NewsIcon,
  CommentIcon,
} from '@client/components/svg';

import {MobileMenuItem} from './MobileMenuItem';

export const MobileMenu = () => {
  const t = useI18n('mobile_menu');

  return (
    <div className='c-mobile-menu'>
      <nav className='c-mobile-menu__list'>
        <MobileMenuItem
          href={HOME_PATH}
          title={t('home')}
          icon={(
            <HomeIcon />
          )}
        />

        <MobileMenuItem
          href={BOOKS_PATH}
          title={t('books')}
          icon={(
            <BookIcon />
          )}
        />

        <MobileMenuItem
          href={TOP_BOOKS_PATH}
          title={t('top')}
          icon={(
            <TrophyIcon />
          )}
        />

        <MobileMenuItem
          href={BOOKS_REVIEWS_PATH}
          title={t('reviews')}
          icon={(
            <CommentIcon />
          )}
        />

        <MobileMenuItem
          href={NEWS_PATH}
          title={t('news')}
          icon={(
            <NewsIcon />
          )}
        />
      </nav>
    </div>
  );
};

MobileMenu.displayName = 'MobileMenu';
