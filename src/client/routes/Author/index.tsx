import React from 'react';

import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';
import {
  Layout,
  Container,
} from '@client/components/ui';

import {AUTHOR_PATH} from '../Links';

export const AuthorRoute: AsyncRoute = () => {
  const t = useI18n();

  return (
    <Layout>
      <Container className='c-book-route'>
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

        AUTOR
      </Container>
    </Layout>
  );
};

AuthorRoute.displayName = 'AuthorRoute';

AuthorRoute.route = {
  path: AUTHOR_PATH,
};

// BookRoute.getInitialProps = async ({api, match}) => ({
//   book: await api.repo.books.findOne(match.params.id),
// });
