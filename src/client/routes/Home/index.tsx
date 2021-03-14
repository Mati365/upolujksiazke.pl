import React from 'react';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {CategoryBooksGroup} from '@api/types';
import {
  Layout,
  Container,
} from '@client/components/ui';

import {RecentCategoriesBooks} from '@client/containers/sections';
import {HOME_PATH} from '../Links';

type HomeRouteProps = {
  recentCategoriesBooks: CategoryBooksGroup[],
};

export const HomeRoute: AsyncRoute = ({recentCategoriesBooks}: HomeRouteProps) => (
  <Layout>
    <Container className='c-sections-list'>
      <RecentCategoriesBooks items={recentCategoriesBooks} />
    </Container>
  </Layout>
);

HomeRoute.route = {
  path: HOME_PATH,
  exact: true,
};

HomeRoute.getInitialProps = async ({api}) => ({
  recentCategoriesBooks: await api.repo.recentBooks.findCategoriesRecentBooks(
    {
      itemsPerGroup: 14,
      limit: 6,
    },
  ),
});
