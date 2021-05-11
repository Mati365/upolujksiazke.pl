import React from 'react';
import c from 'classnames';

import {objPropsToPromise} from '@shared/helpers';
import {genBookCategoryLink} from '@client/routes/Links';

import {BasicWrapperProps} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {AsyncPropsComponent} from '@client/components/utils/asyncRouteUtils';
import {Header} from './Header';
import {Footer} from './Footer';

export type LayoutViewData = {
  rootPopularCategories: BookCategoryRecord[],
  popularCategories: BookCategoryRecord[],
};

export type LayoutProps = BasicWrapperProps & Partial<LayoutViewData>;

export const Layout: AsyncPropsComponent<LayoutProps> = (
  {
    rootPopularCategories,
    popularCategories,
    children,
    className,
  },
) => (
  <>
    <Header
      promoItems={
        rootPopularCategories?.map(
          (category) => ({
            name: category.name,
            href: genBookCategoryLink(category),
          }),
        )
      }
    />

    <main
      className={c(
        'c-layout',
        className,
      )}
    >
      {children}
    </main>

    <Footer popularCategories={popularCategories} />
  </>
);

Layout.displayName = 'Layout';

Layout.getInitialProps = async ({api: {repo}, attrs: {withRootCategories = true} = {}}) => objPropsToPromise(
  {
    rootPopularCategories: withRootCategories && repo.booksCategories.findMostPopularCategories(
      {
        limit: 17,
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
