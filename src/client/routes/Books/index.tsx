import React from 'react';
import {Helmet} from 'react-helmet';

import {objPropsToPromise} from '@shared/helpers';
import {deserializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';
import {serializeAggsToSearchParams} from '@client/containers/kinds/book/filters/helpers/serializeAggsToSearchParams';

import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';

import {Container} from '@client/components/ui';
import {BooksPaginationResultWithAggs} from '@api/repo';
import {BooksBacklinks} from '@client/containers/kinds/book/filters/BooksBacklinks';
import {
  Layout,
  LayoutHeaderTitle,
  LayoutViewData,
} from '@client/containers/layout';

import {
  BooksFiltersContainer,
  getDefaultBooksFilters,
} from '@client/containers/kinds/book/filters/BooksFiltersContainer';

import {BOOKS_PATH} from '../Links';

type BooksRouteViewData = {
  layoutData: LayoutViewData,
  initialBooks: BooksPaginationResultWithAggs,
  initialFilters: any,
};

export const BooksRoute: AsyncRoute<BooksRouteViewData> = (
  {
    layoutData,
    initialBooks,
    initialFilters,
  },
) => {
  const t = useI18n('routes.books.all');
  const breadcrumbs = (
    <Breadcrumbs
      padding='medium'
      items={[
        {
          id: 'books',
          node: t('shared.breadcrumbs.books'),
        },
      ]}
    />
  );

  return (
    <Layout
      {...layoutData}
      hidePromoItems
    >
      <Helmet>
        <title>
          {t('title')}
        </title>
      </Helmet>

      <Container className='c-books-route'>
        <BooksFiltersContainer
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
                  {t('title')}
                </LayoutHeaderTitle>
              </>
            )
          }
          parentGroups={(
            <BooksBacklinks
              categories={layoutData.rootPopularCategories}
              withAllBooksLink={false}
            />
          )}
        />
      </Container>
    </Layout>
  );
};

BooksRoute.displayName = 'BooksRoute';

BooksRoute.route = {
  path: BOOKS_PATH,
};

BooksRoute.getInitialProps = async (attrs) => {
  const {
    api: {repo},
    search,
  } = attrs;

  const initialFilters = {
    ...getDefaultBooksFilters(),
    ...deserializeUrlFilters(search),
  };

  const {
    initialBooks,
    layoutData,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      initialBooks: repo.books.findAggregatedBooks(
        serializeAggsToSearchParams(initialFilters),
      ),
    },
  );

  return {
    initialBooks,
    initialFilters,
    layoutData,
  } as BooksRouteViewData;
};
