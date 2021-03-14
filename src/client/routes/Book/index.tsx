import React from 'react';

import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';
import {
  Layout,
  Container,
} from '@client/components/ui';

import {BOOK_PATH} from '../Links';

export const BookRoute: AsyncRoute = () => {
  const t = useI18n();

  return (
    <Layout>
      <Container>
        <Breadcrumbs
          items={[
            {
              id: 'books',
              node: t('shared.breadcrumbs.books'),
            },
            {
              id: 'book',
              node: 'Hyperion',
            },
          ]}
        />
        ABC
      </Container>
    </Layout>
  );
};

BookRoute.displayName = 'BookRoute';

BookRoute.route = {
  path: BOOK_PATH,
};
