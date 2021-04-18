import React from 'react';
import {Redirect} from 'react-router';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';
import {
  formatBookTitle,
  formatBookVolume,
} from '@client/helpers/logic';

import {useUA} from '@client/modules/ua';
import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';
import {
  BookCardRecord,
  BookFullInfoRecord,
  CategoryBooksGroup,
} from '@api/types';

import {BookReviewsSection} from '@client/containers/kinds/book/sections/BookReviews';
import {
  BookAvailabilitySection,
  BookInfo,
  BookSummariesSection,
  CategoriesGroupsBooksSection,
} from '@client/containers/kinds/book';

import {Container} from '@client/components/ui';
import {Layout, LayoutViewData} from '@client/containers/layout';

import {
  BookLink,
  BOOK_PATH,
  HOME_PATH,
} from '../Links';

type BookRouteViewData = {
  layoutData: LayoutViewData,
  book: BookFullInfoRecord,
  authorsBooks: BookCardRecord[],
  popularCategoriesBooks: CategoryBooksGroup[],
};

export const BookRoute: AsyncRoute<BookRouteViewData> = (
  {
    book,
    authorsBooks,
    layoutData,
    popularCategoriesBooks,
  },
) => {
  const t = useI18n();
  const ua = useUA();

  if (!book)
    return <Redirect to={HOME_PATH} />;

  const {volume, defaultTitle, hierarchy} = book;
  return (
    <Layout {...layoutData}>
      <Container className='c-book-route'>
        <Breadcrumbs
          items={[
            {
              id: 'books',
              node: t('shared.breadcrumbs.books'),
            },
            ...(
              volume && hierarchy?.length
                ? [
                  {
                    id: 'book',
                    node: (
                      <BookLink item={hierarchy[0]}>
                        {defaultTitle}
                      </BookLink>
                    ),
                  },
                  {
                    id: 'volume',
                    node: formatBookVolume(
                      {
                        t,
                        volume,
                      },
                    ),
                  },
                ]
                : [
                  {
                    id: 'book',
                    node: formatBookTitle(
                      {
                        t,
                        book,
                      },
                    ),
                  },
                ]
            ),
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
          <BookSummariesSection book={book} />
          <BookReviewsSection book={book} />
        </BookInfo>

        {popularCategoriesBooks?.length > 0 && (
          <CategoriesGroupsBooksSection items={popularCategoriesBooks} />
        )}
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
      summariesCount: 4,
    },
  );

  if (!book)
    return {};

  const categoriesIds = R.pluck('id', book.categories || []);
  const excludeBooksIds = R.pluck(
    'id',
    book.hierarchy?.length
      ? book.hierarchy
      : [book],
  );

  const {
    authorsBooks,
    layoutData,
    popularCategoriesBooks,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      popularCategoriesBooks: repo.recentBooks.findCategoriesPopularBooks(
        {
          categoriesIds: R.take(5, categoriesIds),
          excludeBooksIds,
          limit: 2,
          itemsPerGroup: 7,
        },
      ),
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
    popularCategoriesBooks,
    book,
    layoutData,
  } as BookRouteViewData;
};
