import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {
  BookCardRecord,
  BookReviewRecord,
  BrochureCardRecord,
  CategoryBooksGroup,
} from '@api/types';

import {Container, Section} from '@client/components/ui';
import {Layout, LayoutViewData, SEOMeta} from '@client/containers/layout';

import {RootCategoriesSection} from '@client/containers/kinds/category';
import {
  RecentBooksSection,
  CategoriesGroupsBooksSection,
  BookThumbCard,
} from '@client/containers/kinds/book';

import {LazyHydrate} from '@client/components/ui/LazyHydrate';
import {RecentlyCommendedBooks} from '@client/containers/kinds/review/sections';
import {RecentBrochuresSection} from '@client/containers/kinds/brochure';
import {HOME_PATH} from '../Links';

type HomeRouteProps = {
  layoutData: LayoutViewData,
  recentBooks: BookCardRecord[],
  recentBrochures: BrochureCardRecord[],
  popularCategoriesBooks: CategoryBooksGroup[],
  recentCommentedBooks: BookReviewRecord[],
};

export const HomeRoute: AsyncRoute = (
  {
    layoutData,
    recentBooks,
    recentBrochures,
    popularCategoriesBooks,
    recentCommentedBooks,
  }: HomeRouteProps,
) => {
  const t = useI18n('routes.home');
  const ua = useUA();

  return (
    <Layout
      {...layoutData}
      hidePromoItems
    >
      <SEOMeta meta={t('seo') as any} />
      <Container className='c-sections-list'>
        <Section className='c-home-categories-section'>
          <RootCategoriesSection
            items={layoutData.rootPopularCategories}
            sectionProps={{
              spaced: 0,
            }}
            gridProps={{
              columns: {
                default: 6,
                xs: 1,
              },
            }}
          />

          {!ua.mobile && (
            <RecentBooksSection
              items={recentBooks}
              sectionProps={{
                spaced: 0,
              }}
              gridProps={{
                cardComponent: BookThumbCard,
                columns: {
                  default: 2,
                },
              }}
            />
          )}
        </Section>

        <RecentlyCommendedBooks items={recentCommentedBooks} />

        <LazyHydrate>
          <RecentBrochuresSection items={recentBrochures} />

          <CategoriesGroupsBooksSection items={popularCategoriesBooks} />

          {ua.mobile && (
            <RecentBooksSection items={recentBooks} />
          )}
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
      recentBrochures: repo.brochures.findRecentBrochures(
        {
          limit: 7,
        },
      ),
      recentBooks: repo.books.findRecentBooks(
        {
          limit: 6,
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
          limit: 12,
        },
      ),
    },
  );
};
