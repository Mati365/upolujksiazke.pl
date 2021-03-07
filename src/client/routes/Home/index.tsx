import React from 'react';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';

export const HomeRoute: AsyncRoute = () => (
  <div>
    TEST
  </div>
);

HomeRoute.getInitialProps = async ({api}) => {
  const t = Date.now();
  const r = await api.repo.recentBooks.findCategoriesRecentBooks();
  console.info(Date.now() - t, JSON.stringify(r, null, 2));

  return null;
};
