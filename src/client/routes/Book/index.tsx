import React from 'react';
import {Redirect} from 'react-router';
import * as R from 'ramda';

import {ICON_EMOJI_MAPPINGS} from '@client/components/svg';

import {formatBookTitle} from '@client/helpers/logic';
import {
  objPropsToPromise,
  truncateText,
} from '@shared/helpers';

import {useUA} from '@client/modules/ua';
import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {BooksAuthorsGroupedBooks} from '@api/repo';
import {
  BookFullInfoRecord,
  CategoryBooksGroup,
} from '@api/types';

import {BookLatestReviewsSection} from '@client/containers/kinds/review/sections/BookLatestReviews';
import {
  BookAvailabilitySection,
  BookInfo,
  BookSummariesSection,
  CategoriesGroupsBooksSection,
} from '@client/containers/kinds/book';

import {Container} from '@client/components/ui';
import {Layout, LayoutViewData, SEOMeta} from '@client/containers/layout';
import {BookBreadcrumbs} from './parts';
import {
  BOOK_PATH,
  HOME_PATH,
} from '../Links';

import {useTrackBookRoute} from './hooks/useTrackBookRoute';

type BookRouteViewData = {
  layoutData: LayoutViewData,
  book: BookFullInfoRecord,
  authorsBooks: BooksAuthorsGroupedBooks,
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
  const t = useI18n('routes.book');
  const ua = useUA();

  useTrackBookRoute(
    {
      recordId: book?.id,
    },
  );

  if (!book)
    return <Redirect to={HOME_PATH} />;

  const authorsSeoString = R.pluck('name', book.authors).join(', ');
  const seoMeta = {
    title: t(
      'seo.title',
      {
        emoji: ICON_EMOJI_MAPPINGS[book.primaryCategory.icon] || '',
        authors: authorsSeoString,
        title: formatBookTitle(
          {
            t,
            book,
          },
        ),
      },
    ).trim(),

    description: (
      book.nonHTMLDescription
        ? truncateText(140, book.nonHTMLDescription)
        : t('routes.home.seo.description')
    ),

    cover: book.primaryRelease.cover.preview?.file,
  };

  return (
    <Layout {...layoutData}>
      <SEOMeta meta={seoMeta} />
      <Container className='c-book-route'>
        <BookBreadcrumbs book={book} />

        <BookInfo
          book={book}
          authorsBooks={authorsBooks}
        >
          <BookAvailabilitySection
            book={book}
            shrink={ua.mobile}
          />
          <BookLatestReviewsSection book={book} />
          <BookSummariesSection book={book} />
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
  exact: true,
};

/**
 * See RedisCacheWarmup when you edit any cached
 * query, prefer using default values
 */
BookRoute.getInitialProps = async (attrs) => {
  const {api: {repo}, match} = attrs;
  const {layoutData, book} = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      book: repo.books.findOne(match.params.id),
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
    popularCategoriesBooks,
  } = await objPropsToPromise(
    {
      popularCategoriesBooks: repo.recentBooks.findCategoriesPopularBooks(
        {
          categoriesIds: R.take(5, categoriesIds),
          excludeBooksIds,
          limit: 2,
          itemsPerGroup: 7,
        },
      ),
      authorsBooks: repo.books.findGroupedAuthorsBooks(
        {
          excludeIds: [book.id],
          limit: 4,
          authorsIds: R.pluck('id', book.authors),
        },
      ),
    },
  );

  return {
    authorsBooks,
    popularCategoriesBooks,
    book,
    layoutData,
  } as BookRouteViewData;
};
