import React from 'react';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';

export const HomeRoute: AsyncRoute = () => (
  <div>
    TEST
  </div>
);

HomeRoute.getInitialProps = async ({api}) => {
  await api.repo.books.findCategoriesRecentBooks();

  return null;
};
