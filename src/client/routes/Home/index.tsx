import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {
  BookCardRecord,
  BookReviewRecord,
  CategoryBooksGroup,
} from '@api/types';

import {Container} from '@client/components/ui';
import {Layout, LayoutViewData, SEOMeta} from '@client/containers/layout';

import {RootCategoriesSection} from '@client/containers/kinds/category';
import {
  RecentBooksSection,
  CategoriesGroupsBooksSection,
} from '@client/containers/kinds/book';

import {LazyHydrate} from '@client/components/ui/LazyHydrate';
import {RecentlyCommendedBooks} from '@client/containers/kinds/review/sections';
import {HOME_PATH} from '../Links';

type HomeRouteProps = {
  layoutData: LayoutViewData,
  recentBooks: BookCardRecord[],
  popularCategoriesBooks: CategoryBooksGroup[],
  recentCommentedBooks: BookReviewRecord[],
};

export const HomeRoute: AsyncRoute = (
  {
    layoutData,
    recentBooks,
    popularCategoriesBooks,
    recentCommentedBooks,
  }: HomeRouteProps,
) => {
  const t = useI18n('routes.home');

  return (
    <Layout
      {...layoutData}
      hidePromoItems
    >
      <SEOMeta meta={t('seo') as any} />
      <Container className='c-sections-list'>
        <RootCategoriesSection items={layoutData.rootPopularCategories} />
        <RecentlyCommendedBooks items={recentCommentedBooks} />

        <LazyHydrate>
          <CategoriesGroupsBooksSection items={popularCategoriesBooks} />
          <RecentBooksSection items={recentBooks} />
        </LazyHydrate>
      </Container>
    </Layout>
  );
};

HomeRoute.route = {
  path: HOME_PATH,
  exact: true,
};

HomeRoute.getInitialProps = (attrs) => {
  const {api: {repo}} = attrs;

  return objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      recentBooks: repo.books.findRecentBooks(
        {
          limit: 7,
        },
      ),
      popularCategoriesBooks: repo.recentBooks.findCategoriesPopularBooks(
        {
          itemsPerGroup: 14,
          limit: 4,
          root: true,
        },
      ),
      recentCommentedBooks: repo.booksReviews.findRecentCommentedBooks(
        {
          limit: 4,
        },
      ),
    },
  );
};
