import React from 'react';
import {Redirect} from 'react-router';
import * as R from 'ramda';

import {formatBookTitle} from '@client/helpers/logic';
import {objPropsToPromise} from '@shared/helpers';
import {deserializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';
import {getDefaultPaginationFilters} from '@api/helpers';

import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {BookFullInfoRecord} from '@api/types';
import {BookPaginatedReviews} from '@client/containers/kinds/review/BookPaginatedReviews';

import {Container} from '@client/components/ui';
import {BookSecondarySidebarContainer} from '@client/containers/kinds/book';
import {Layout, LayoutViewData, SEOMeta} from '@client/containers/layout';
import {BookReviewsFilters, BookReviewsPaginationResult} from '@api/repo';
import {BookBreadcrumbs} from './parts';
import {
  BOOK_ALL_REVIEWS_PATH,
  HOME_PATH,
} from '../Links';

type BookAllReviewsRouteViewData = {
  layoutData: LayoutViewData,
  book: BookFullInfoRecord,
  initialReviews: BookReviewsPaginationResult,
  initialFilters: BookReviewsFilters,
};

export const BookAllReviewsRoute: AsyncRoute<BookAllReviewsRouteViewData> = (
  {
    book,
    layoutData,
    initialReviews,
    initialFilters,
  },
) => {
  const t = useI18n('routes.book.reviews');

  if (!book)
    return <Redirect to={HOME_PATH} />;

  const seoMeta = {
    title: t(
      'seo.title',
      {
        authors: R.pluck('name', book.authors).join(', '),
        title: formatBookTitle(
          {
            t,
            book,
          },
        ),
      },
    ).trim(),

    description: t('seo.description'),
    cover: book.primaryRelease.cover.preview?.file,
  };

  return (
    <Layout {...layoutData}>
      <SEOMeta meta={seoMeta} />
      <Container className='c-book-reviews-route'>
        <BookBreadcrumbs
          book={book}
          additionalItems={[
            {
              id: 'reviews',
              node: t('shared.breadcrumbs.reviews'),
            },
          ]}
        />

        <BookSecondarySidebarContainer book={book}>
          <BookPaginatedReviews
            spaced={0}
            totalReviews={book.totalTextReviews}
            initialReviews={initialReviews}
            initialFilters={initialFilters}
          />
        </BookSecondarySidebarContainer>
      </Container>
    </Layout>
  );
};

BookAllReviewsRoute.displayName = 'BookAllReviewsRoute';

BookAllReviewsRoute.route = {
  path: BOOK_ALL_REVIEWS_PATH,
};

BookAllReviewsRoute.getInitialProps = async (attrs) => {
  const {
    api: {repo},
    match,
    search,
  } = attrs;

  const initialFilters = {
    ...getDefaultPaginationFilters(),
    ...deserializeUrlFilters(search),
    bookId: +match.params.id,
  };

  const {layoutData, book, initialReviews} = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      book: repo.books.findOne(match.params.id),
      initialReviews: repo.booksReviews.findAll(initialFilters),
      initialFilters,
    },
  );

  if (!book)
    return {};

  return {
    book,
    layoutData,
    initialReviews,
    initialFilters,
  } as BookAllReviewsRouteViewData;
};
