import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {NewsIcon} from '@client/components/svg';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/kinds/breadcrumbs';
import {Container} from '@client/components/ui';
import {BookReviewRecord} from '@api/types';
import {BooksReviewsGrid} from '@client/containers/kinds/review/grids/BooksReviewsGrid';
import {
  Layout,
  LayoutHeaderTitle,
  LayoutViewData,
  SEOMeta,
} from '@client/containers/layout';

import {
  BOOKS_REVIEWS_PATH,
  genAllBooksReviewsLink,
} from '../Links';

type ReviewsRouteRoute = {
  layoutData: LayoutViewData,
  recentCommentedBooks: BookReviewRecord[],
};

export const ReviewsRoute: AsyncRoute<ReviewsRouteRoute> = (
  {
    layoutData,
    recentCommentedBooks,
  },
) => {
  const t = useI18n('routes.reviews');
  const breadcrumbs = (
    <Breadcrumbs
      items={[
        {
          id: 'reviews',
          path: genAllBooksReviewsLink(),
          title: t('shared.breadcrumbs.reviews'),
        },
      ]}
    />
  );

  return (
    <Layout {...layoutData}>
      <SEOMeta
        meta={{
          title: t('seo.title'),
          description: t('seo.description'),
        }}
      />

      <Container className='c-reviews-route'>
        {breadcrumbs}

        <LayoutHeaderTitle margin='medium'>
          <NewsIcon className='mr-2' />
          {t('title')}
        </LayoutHeaderTitle>

        <BooksReviewsGrid items={recentCommentedBooks} />
      </Container>
    </Layout>
  );
};

ReviewsRoute.displayName = 'ReviewsRoute';

ReviewsRoute.route = {
  path: BOOKS_REVIEWS_PATH,
};

ReviewsRoute.getInitialProps = async (attrs) => {
  const {api: {repo}} = attrs;
  const {
    layoutData,
    recentCommentedBooks,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      recentCommentedBooks: repo.booksReviews.findRecentCommentedBooks(
        {
          limit: 16,
        },
      ),
    },
  );

  return {
    layoutData,
    recentCommentedBooks,
  } as ReviewsRouteRoute;
};
