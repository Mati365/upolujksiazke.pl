import React from 'react';
import {useI18n} from '@client/i18n';

import {
  BOOKS_PATH,
  HOME_PATH,
  NEWS_PATH,
  TOP_BOOKS_PATH,
} from '@client/routes/Links';

import {TextButton} from '@client/components/ui';
import {
  TrophyIcon,
  SearchIcon,
  HomeIcon,
  BookIcon,
  NewsIcon,
} from '@client/components/svg';

import {BottomMenuItem} from './BottomMenuItem';

export const BottomMenu = () => {
  const t = useI18n('bottom_menu');

  return (
    <nav className='c-bottom-menu'>
      <BottomMenuItem
        href={BOOKS_PATH}
        title={t('books')}
        icon={(
          <BookIcon />
        )}
      />

      <BottomMenuItem
        href={TOP_BOOKS_PATH}
        title={t('top')}
        icon={(
          <TrophyIcon />
        )}
      />

      <BottomMenuItem
        href={HOME_PATH}
        title={t('home')}
        icon={(
          <HomeIcon />
        )}
      />

      <BottomMenuItem
        href={NEWS_PATH}
        title={t('news')}
        icon={(
          <NewsIcon />
        )}
      />

      <BottomMenuItem
        tag={TextButton}
        title={t('search')}
        icon={(
          <SearchIcon />
        )}
      />
    </nav>
  );
};

BottomMenu.displayName = 'Header';
