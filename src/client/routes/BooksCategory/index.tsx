import React from 'react';
import {Redirect} from 'react-router-dom';

import {capitalize, objPropsToPromise} from '@shared/helpers';
import {deserializeUrlFilters} from '@client/containers/filters/hooks/useStoreFiltersInURL';
import {serializeAggsToSearchParams} from '@client/containers/kinds/book/filters/helpers/serializeAggsToSearchParams';

import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';
import {DynamicIcon} from '@client/components/svg';

import {Container} from '@client/components/ui';
import {BooksPaginationResultWithAggs} from '@api/repo';
import {BookCategoryRecord} from '@api/types';
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

import {
  BooksLink,
  BOOKS_CATEGORY_PATH,
  BOOKS_PATH,
} from '../Links';

type BooksRouteViewData = {
  category: BookCategoryRecord,
  layoutData: LayoutViewData,
  initialBooks: BooksPaginationResultWithAggs,
  initialFilters: any,
};

export const BooksCategoryRoute: AsyncRoute<BooksRouteViewData> = (
  {
    layoutData,
    category,
    initialBooks,
    initialFilters,
  },
) => {
  const t = useI18n('routes.books.category');

  if (!category)
    return <Redirect to={BOOKS_PATH} />;

  return (
    <Layout
      {...layoutData}
      hidePromoItems
    >
      <Container className='c-book-route'>
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
              id: 'category',
              node: capitalize(category.name),
            },
          ]}
        />

        <BooksFiltersContainer
          initialBooks={initialBooks}
          initialFilters={initialFilters}
          overrideFilters={{
            parentCategoriesIds: [category.id],
          }}
          contentHeader={(
            <LayoutHeaderTitle margin='medium'>
              <DynamicIcon
                icon={category.icon}
                className='mr-2'
              />
              {t('title', [category.name])}
            </LayoutHeaderTitle>
          )}
          parentGroups={(
            <BooksBacklinks
              currentCategory={category}
              categories={layoutData.rootPopularCategories}
            />
          )}
        />
      </Container>
    </Layout>
  );
};

BooksCategoryRoute.displayName = 'BooksCategoryRoute';

BooksCategoryRoute.route = {
  path: BOOKS_CATEGORY_PATH,
};

BooksCategoryRoute.getInitialProps = async (attrs) => {
  const {
    api: {repo},
    match: {params},
    search,
  } = attrs;

  const initialFilters = deserializeUrlFilters(search);
  const {
    initialBooks,
    layoutData,
    category,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      category: repo.booksCategories.findOne(
        params.id,
        {
          root: true,
        },
      ),
      initialBooks: repo.books.findAggregatedBooks(
        {
          ...getDefaultBooksFilters(),
          ...serializeAggsToSearchParams(initialFilters),
          parentCategoriesIds: [params.id],
        },
      ),
    },
  );

  return {
    initialBooks,
    initialFilters,
    layoutData,
    category,
  } as BooksRouteViewData;
};
