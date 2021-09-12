import React from 'react';
import c from 'classnames';

import {objPropsToPromise} from '@shared/helpers';
import {useUA} from '@client/modules/ua';

import {BasicWrapperProps} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {AsyncPropsComponent} from '@client/components/utils/asyncRouteUtils';
import {Header, HeaderProps} from './Header';
import {Footer} from './Footer';
import {RepoRibbon} from './RepoRibbon';

export type LayoutViewData = {
  hideHeader?: boolean,
  hidePromoItems?: boolean,
  hideMobileMenu?: boolean,
  noLayoutSpace?: boolean,
  headerProps?: Partial<HeaderProps>,
  rootPopularCategories?: BookCategoryRecord[],
  popularCategories: BookCategoryRecord[],
};

export type LayoutProps = BasicWrapperProps & Partial<LayoutViewData>;

export const Layout: AsyncPropsComponent<LayoutProps> = (
  {
    hideHeader,
    hidePromoItems,
    hideMobileMenu,
    noLayoutSpace,
    headerProps,
    rootPopularCategories,
    popularCategories,
    children,
    className,
  },
) => {
  const ua = useUA();

  return (
    <>
      {!hideHeader && (
        <Header
          popularCategories={rootPopularCategories}
          hideMobileMenu={hideMobileMenu}
          hidePromoBar={
            ua.mobile || hidePromoItems
          }
          {...headerProps}
        />
      )}

      <main
        className={c(
          'c-layout',
          !noLayoutSpace && ua.mobile && 'has-top-space',
          className,
        )}
      >
        {children}
      </main>

      {!ua.mobile && (
        <RepoRibbon />
      )}

      <Footer popularCategories={popularCategories} />
    </>
  );
};

Layout.displayName = 'Layout';

Layout.getInitialProps = async ({api: {repo}}) => objPropsToPromise(
  {
    rootPopularCategories: repo.booksCategories.findMostPopularCategories(
      {
        limit: 23,
        root: true,
      },
    ),
    popularCategories: repo.booksCategories.findMostPopularCategories(
      {
        limit: 13,
      },
    ),
  },
);
