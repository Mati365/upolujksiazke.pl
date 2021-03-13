import React from 'react';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {CategoryBooksGroup} from '@api/types';
import {
  Layout,
  Container,
} from '@client/components/ui';

import {RecentCategoriesBooks} from '@client/containers/sections';

type HomeRouteProps = {
  recentCategoriesBooks: CategoryBooksGroup[],
};

export const HomeRoute: AsyncRoute = ({recentCategoriesBooks}: HomeRouteProps) => (
  <Layout>
    <Container>
      <RecentCategoriesBooks items={recentCategoriesBooks} />
    </Container>
  </Layout>
);

HomeRoute.getInitialProps = async ({api}) => ({
  recentCategoriesBooks: await api.repo.recentBooks.findCategoriesRecentBooks(
    {
      itemsPerGroup: 12,
      limit: 6,
    },
  ),
});
