import React from 'react';
import c from 'classnames';

import {objPropsToPromise} from '@shared/helpers';
import {genBookCategoryLink} from '@client/routes/Links';
import {useUA} from '@client/modules/ua';

import {BasicWrapperProps} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {AsyncPropsComponent} from '@client/components/utils/asyncRouteUtils';
import {Header} from './Header';
import {Footer} from './Footer';
import {BottomMenu} from './BottomMenu';

export type LayoutViewData = {
  hidePromoItems?: boolean,
  rootPopularCategories: BookCategoryRecord[],
  popularCategories: BookCategoryRecord[],
};

export type LayoutProps = BasicWrapperProps & Partial<LayoutViewData>;

export const Layout: AsyncPropsComponent<LayoutProps> = (
  {
    hidePromoItems,
    rootPopularCategories,
    popularCategories,
    children,
    className,
  },
) => {
  const ua = useUA();

  return (
    <>
      {!ua.mobile && (
        <Header
          promoItems={
            !hidePromoItems && rootPopularCategories?.map(
              (category) => ({
                icon: category.icon,
                name: category.name,
                href: genBookCategoryLink(category),
              }),
            )
          }
        />
      )}

      <main
        className={c(
          'c-layout',
          ua.mobile && 'has-top-space',
          className,
        )}
      >
        {children}

        {ua.mobile && (
          <BottomMenu />
        )}
      </main>

      <Footer popularCategories={popularCategories} />
    </>
  );
};

Layout.displayName = 'Layout';

Layout.getInitialProps = async ({api: {repo}, attrs: {withRootCategories = true} = {}}) => objPropsToPromise(
  {
    rootPopularCategories: withRootCategories && repo.booksCategories.findMostPopularCategories(
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
