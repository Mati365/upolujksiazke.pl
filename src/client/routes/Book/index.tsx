import React from 'react';
import {
  Layout,
  Container,
} from '@client/components/ui';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {BOOK_PATH} from '../Links';

export const BookRoute: AsyncRoute = () => (
  <Layout>
    <Container className='c-sections-list'>
      ABC
    </Container>
  </Layout>
);

BookRoute.displayName = 'BookRoute';

BookRoute.route = {
  path: BOOK_PATH,
};
