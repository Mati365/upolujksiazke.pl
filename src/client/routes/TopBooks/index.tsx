import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/Breadcrumbs';
import {Container} from '@client/components/ui';
import {
  Layout,
  LayoutHeaderTitle,
  LayoutViewData,
} from '@client/containers/layout';

import {
  BooksLink,
  TOP_BOOKS_PATH,
} from '../Links';

type TopBooksRouteRouteData = {
  layoutData: LayoutViewData,
};

export const TopBooksRoute: AsyncRoute<TopBooksRouteRouteData> = (
  {
    layoutData,
  },
) => {
  const t = useI18n('routes.top_books');

  return (
    <Layout {...layoutData}>
      <Container className='c-top-books-route'>
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

        <LayoutHeaderTitle>
          {t('title')}
        </LayoutHeaderTitle>
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
    layoutData,
  } = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
    },
  );

  return {
    layoutData,
  } as TopBooksRouteRouteData;
};
