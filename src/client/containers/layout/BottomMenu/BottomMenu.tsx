import React, {useState} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {useLockWebsiteScroll} from '@client/hooks';

import {
  BOOKS_PATH,
  HOME_PATH,
  NEWS_PATH,
  TOP_BOOKS_PATH,
} from '@client/routes/Links';

import {BookCategoryRecord} from '@api/types';
import {TextButton} from '@client/components/ui';
import {CategoriesGrid} from '@client/containers/kinds/category';
import {
  TrophyIcon,
  SearchIcon,
  HomeIcon,
  BookIcon,
  NewsIcon,
  TimesIcon,
} from '@client/components/svg';

import {BottomMenuItem} from './BottomMenuItem';

type BottomMenuProps = {
  popularCategories: BookCategoryRecord[],
};

export const BottomMenu = ({popularCategories}: BottomMenuProps) => {
  const t = useI18n('bottom_menu');
  const [toggledSearch, setSearchToggle] = useState(false);

  useLockWebsiteScroll(toggledSearch);

  return (
    <div
      className={c(
        'c-bottom-menu',
        toggledSearch && 'is-active',
      )}
    >
      <nav className='c-bottom-menu__list'>
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
          {...(
            toggledSearch
              ? {
                icon: <TimesIcon />,
                title: t('shared.titles.close'),
              }
              : {
                icon: <SearchIcon />,
                title: t('search'),
              }
          )}
          onClick={
            () => {
              setSearchToggle(!toggledSearch);
            }
          }
        />
      </nav>

      {toggledSearch && (
        <div className='c-bottom-menu__content'>
          <CategoriesGrid
            items={popularCategories}
            allowExpand={false}
          />
        </div>
      )}
    </div>
  );
};

BottomMenu.displayName = 'Header';
