import React from 'react';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Container} from '@client/components/ui';
import {Layout} from '@client/containers';

export const HomeRoute: AsyncRoute = () => (
  <Layout>
    <Container>
      ABC
    </Container>
  </Layout>
);

HomeRoute.getInitialProps = async ({api}) => {
  await api.repo.recentBooks.findCategoriesRecentBooks();
  return null;
};
