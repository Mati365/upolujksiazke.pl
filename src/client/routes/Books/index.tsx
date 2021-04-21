import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';

import {Container} from '@client/components/ui';
import {Layout, LayoutViewData} from '@client/containers/layout';
import {BooksFiltersContainer} from '@client/containers/kinds/book/filters/BooksFiltersContainer';
import {BookCardRecord} from '@api/types';

import {BOOKS_PATH} from '../Links';

type BooksRouteViewData = {
  layoutData: LayoutViewData,
  initialBooks: BookCardRecord[],
};

export const BooksRoute: AsyncRoute<BooksRouteViewData> = (
  {
    layoutData,
    initialBooks,
  },
) => {
  const t = useI18n();

  return (
    <Layout {...layoutData}>
      <Container className='c-book-route'>
        <Breadcrumbs
          items={[
            {
              id: 'books',
              node: t('shared.breadcrumbs.books'),
            },
          ]}
        />

        <BooksFiltersContainer initialBooks={initialBooks} />
      </Container>
    </Layout>
  );
};

BooksRoute.displayName = 'BooksRoute';

BooksRoute.route = {
  path: BOOKS_PATH,
};

BooksRoute.getInitialProps = async (attrs) => {
  const {api: {repo}} = attrs;
  const {
    initialBooks,
    layoutData,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      initialBooks: repo.books.findRecentBooks(
        {
          limit: 36,
        },
      ),
    },
  );

  return {
    initialBooks,
    layoutData,
  } as BooksRouteViewData;
};
