import React from 'react';
import {Redirect} from 'react-router';
import * as R from 'ramda';

import {formatBookTitle} from '@client/helpers/logic';
import {useI18n} from '@client/i18n';

import {BookCardRecord, BookFullInfoRecord} from '@api/types';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';

import {BookReviewsSection} from '@client/containers/kinds/book/sections/BookReviews';
import {
  BookAvailabilitySection,
  BookInfo,
} from '@client/containers/kinds/book';

import {
  Layout,
  Container,
} from '@client/components/ui';

import {
  BOOK_PATH,
  HOME_PATH,
} from '../Links';

type BookRouteProps = {
  book: BookFullInfoRecord,
  authorsBooks: BookCardRecord[],
};

export const BookRoute: AsyncRoute = ({book, authorsBooks}: BookRouteProps) => {
  const t = useI18n();
  if (!book)
    return <Redirect to={HOME_PATH} />;

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
              node: formatBookTitle(
                {
                  t,
                  book,
                },
              ),
            },
          ]}
        />
        <BookInfo
          book={book}
          authorsBooks={authorsBooks}
        >
          <BookAvailabilitySection book={book} />
          <BookReviewsSection book={book} />
        </BookInfo>
      </Container>
    </Layout>
  );
};

BookRoute.displayName = 'BookRoute';

BookRoute.route = {
  path: BOOK_PATH,
};

BookRoute.getInitialProps = async ({api: {repo}, match}) => {
  const book = await repo.books.findOne(
    match.params.id,
    {
      reviewsCount: 5,
    },
  );

  if (!book)
    return {};

  const {items: authorsBooks} = await repo.books.findAuthorsBooks(
    {
      excludeIds: [book.id],
      limit: 4,
      authorsIds: R.pluck('id', book.authors),
    },
  );

  return {
    book,
    authorsBooks,
  };
};
