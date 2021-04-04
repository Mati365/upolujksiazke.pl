import React from 'react';
import c from 'classnames';

import {objPropsToPromise} from '@shared/helpers';

import {BasicWrapperProps} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {AsyncPropsComponent} from '@client/components/utils/asyncRouteUtils';
import {Footer} from '@client/containers/layout/Footer';

export type LayoutViewData = {
  popularCategories: BookCategoryRecord[],
};

export type LayoutProps = BasicWrapperProps & Partial<LayoutViewData>;

export const Layout: AsyncPropsComponent<LayoutProps> = (
  {
    popularCategories,
    children,
    className,
  },
) => (
  <>
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

Layout.getInitialProps = async ({api: {repo}}) => objPropsToPromise(
  {
    popularCategories: repo.booksCategories.findMostPopularCategories(
      {
        limit: 9,
      },
    ),
  },
);
