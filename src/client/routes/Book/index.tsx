import React from 'react';

import {useI18n} from '@client/i18n';

import {BookFullInfoRecord} from '@api/types';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';
import {BookInfo} from '@client/containers/sections/BookInfo';
import {
  Layout,
  Container,
} from '@client/components/ui';

import {BOOK_PATH} from '../Links';

type BookRouteProps = {
  book: BookFullInfoRecord,
};

export const BookRoute: AsyncRoute = ({book}: BookRouteProps) => {
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
        <BookInfo book={book} />
      </Container>
    </Layout>
  );
};

BookRoute.displayName = 'BookRoute';

BookRoute.route = {
  path: BOOK_PATH,
};

BookRoute.getInitialProps = async ({api, match}) => ({
  book: await api.repo.books.findOne(match.params.id),
});
