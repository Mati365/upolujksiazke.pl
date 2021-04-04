import React from 'react';

import {objPropsToPromise} from '@shared/helpers';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {
  BookCardRecord,
  CategoryBooksGroup,
} from '@api/types';

import {Container} from '@client/components/ui';
import {Layout} from '@client/containers/layout';

import {
  RecentBooksSection,
  CategoriesGroupsBooksSection,
} from '@client/containers/kinds/book';

import {LazyHydrate} from '@client/components/ui/LazyHydrate';
import {HOME_PATH} from '../Links';

type HomeRouteProps = {
  recentBooks: BookCardRecord[],
  popularCategoriesBooks: CategoryBooksGroup[],
};

export const HomeRoute: AsyncRoute = (
  {
    recentBooks,
    popularCategoriesBooks,
  }: HomeRouteProps,
) => (
  <Layout>
    <LazyHydrate>
      <Container className='c-sections-list'>
        <RecentBooksSection items={recentBooks} />
        <CategoriesGroupsBooksSection items={popularCategoriesBooks} />
      </Container>
    </LazyHydrate>
  </Layout>
);

HomeRoute.route = {
  path: HOME_PATH,
  exact: true,
};

HomeRoute.getInitialProps = ({api: {repo}}) => objPropsToPromise(
  {
    recentBooks: repo.books.findRecentBooks(
      {
        limit: 7,
      },
    ),
    popularCategoriesBooks: repo.recentBooks.findCategoriesPopularBooks(
      {
        itemsPerGroup: 14,
        limit: 3,
      },
    ),
  },
);
