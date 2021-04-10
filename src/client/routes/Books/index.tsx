import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';

import {Container} from '@client/components/ui';
import {Layout, LayoutViewData} from '@client/containers/layout';

import {BOOKS_PATH} from '../Links';

type BooksRouteViewData = {
  layoutData: LayoutViewData,
};

export const BooksRoute: AsyncRoute<BooksRouteViewData> = (
  {
    layoutData,
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

        ABC
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
    layoutData,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
    },
  );

  return {
    layoutData,
  } as BooksRouteViewData;
};
