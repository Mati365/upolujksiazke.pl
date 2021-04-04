import React from 'react';
import {Redirect} from 'react-router';
import * as R from 'ramda';

import {formatBookTitle} from '@client/helpers/logic';
import {objPropsToPromise} from '@shared/helpers';

import {useUA} from '@client/modules/ua';
import {useI18n} from '@client/i18n';

import {BookCardRecord, BookFullInfoRecord} from '@api/types';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';

import {BookReviewsSection} from '@client/containers/kinds/book/sections/BookReviews';
import {
  BookAvailabilitySection,
  BookInfo,
} from '@client/containers/kinds/book';

import {Container} from '@client/components/ui';
import {Layout, LayoutViewData} from '@client/containers/layout';

import {
  BOOK_PATH,
  HOME_PATH,
} from '../Links';

type BookRouteViewData = {
  layoutData: LayoutViewData,
  book: BookFullInfoRecord,
  authorsBooks: BookCardRecord[],
};

export const BookRoute: AsyncRoute<BookRouteViewData> = (
  {
    book,
    authorsBooks,
    layoutData,
  },
) => {
  const t = useI18n();
  const ua = useUA();

  if (!book)
    return <Redirect to={HOME_PATH} />;

  return (
    <Layout {...layoutData}>
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
          <BookAvailabilitySection
            book={book}
            shrink={ua.mobile}
          />
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

BookRoute.getInitialProps = async (attrs) => {
  const {api: {repo}, match} = attrs;
  const book = await repo.books.findOne(
    match.params.id,
    {
      reviewsCount: 5,
    },
  );

  if (!book)
    return {};

  const {
    authorsBooks,
    layoutData,
  } = await objPropsToPromise(
    {
      layoutData: await Layout.getInitialProps(attrs),
      authorsBooks: repo.books.findAuthorsBooks(
        {
          excludeIds: [book.id],
          limit: 4,
          authorsIds: R.pluck('id', book.authors),
        },
      ),
    },
  );

  return {
    authorsBooks: authorsBooks.items,
    book,
    layoutData,
  } as BookRouteViewData;
};
