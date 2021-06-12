import React from 'react';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';
import {deserializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';
import {serializeFiltersToSearchParams} from '@api/helpers';
import {
  BooksFiltersContainer,
  getDefaultBooksFilters,
} from '@client/containers/kinds/book/filters/BooksFiltersContainer';

import {useI18n} from '@client/i18n';

import {TrophyIcon} from '@client/components/svg';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';
import {Container} from '@client/components/ui';
import {ViewMode} from '@shared/enums';
import {
  Layout,
  LayoutHeaderTitle,
  LayoutViewData,
  SEOMeta,
} from '@client/containers/layout';

import {BooksPaginationResultWithAggs} from '@api/repo';
import {
  BooksLink,
  TOP_BOOKS_PATH,
} from '../Links';

function serializeTopBooksFilters(filters: any) {
  return {
    ...serializeFiltersToSearchParams(filters),
    selectDescription: true,
  };
}

type TopBooksRouteRouteData = {
  layoutData: LayoutViewData,
  initialBooks: BooksPaginationResultWithAggs,
  initialFilters: any,
};

export const TopBooksRoute: AsyncRoute<TopBooksRouteRouteData> = (
  {
    layoutData,
    initialBooks,
    initialFilters,
  },
) => {
  const t = useI18n('routes.top_books');
  const breadcrumbs = (
    <Breadcrumbs
      items={[
        {
          id: 'books',
          node: (
            <BooksLink>
              {t('shared.breadcrumbs.books')}
            </BooksLink>
          ),
        },
        {
          id: 'trending books',
          node: t('shared.breadcrumbs.top_books'),
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
          cover: initialBooks[0]?.primaryRelease.cover.preview?.file,
        }}
      />

      <Container className='c-top-books-route'>
        <BooksFiltersContainer
          hideSidebar
          hideSort
          filtersSerializeFn={serializeTopBooksFilters}
          promiseFn={
            ({api, filters}) => api.repo.books.findTopRankingBooks(filters)
          }
          initialBooks={initialBooks}
          initialFilters={initialFilters}
          contentHeader={
            ({searchInput}) => (
              <>
                {breadcrumbs}
                <LayoutHeaderTitle
                  margin='medium'
                  toolbar={searchInput}
                >
                  <TrophyIcon className='mr-2' />
                  {t('title')}
                </LayoutHeaderTitle>
              </>
            )
          }
        />
      </Container>
    </Layout>
  );
};

TopBooksRoute.displayName = 'TopBooksRoute';

TopBooksRoute.route = {
  path: TOP_BOOKS_PATH,
  exact: true,
};

TopBooksRoute.getInitialProps = async (attrs) => {
  const {
    api: {repo},
    search,
  } = attrs;

  const initialFilters = {
    viewMode: ViewMode.LIST,
    ...R.omit(['sort', 'viewMode'], getDefaultBooksFilters()),
    ...deserializeUrlFilters(search),
  };

  const {
    initialBooks,
    layoutData,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      initialBooks: repo.books.findTopRankingBooks(
        serializeTopBooksFilters(initialFilters),
      ),
    },
  );

  return {
    initialBooks,
    initialFilters,
    layoutData,
  } as TopBooksRouteRouteData;
};
