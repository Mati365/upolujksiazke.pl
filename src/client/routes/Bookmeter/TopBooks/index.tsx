import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {UserVoiceIcon} from '@client/components/svg';

import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/kinds/breadcrumbs';
import {Container} from '@client/components/ui';
import {
  Layout,
  LayoutHeaderTitle,
  LayoutViewData,
  SEOMeta,
} from '@client/containers/layout';

import {
  genBookmeterTopBooksPath,
  BOOKMETER_TOP_BOOKS_PATH,
} from '../../Links';

type BookmeterTopBooksRouteViewData = {
  layoutData: LayoutViewData,
};

export const BookmeterTopBooksRoute: AsyncRoute<BookmeterTopBooksRouteViewData> = (
  {
    layoutData,
  },
) => {
  const t = useI18n('routes.bookmeter.top_books');
  const breadcrumbs = (
    <Breadcrumbs
      items={[
        {
          id: 'bookmeter',
          path: genBookmeterTopBooksPath(),
          title: t('shared.breadcrumbs.bookmeter'),
        },
        {
          id: 'top_books',
          path: genBookmeterTopBooksPath(),
          title: t('shared.breadcrumbs.top_books'),
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

      <Container className='c-news-route'>
        {breadcrumbs}
        <LayoutHeaderTitle margin='medium'>
          <UserVoiceIcon className='mr-2' />
          {t('title')}
        </LayoutHeaderTitle>

        Bookmeter
      </Container>
    </Layout>
  );
};

BookmeterTopBooksRoute.displayName = 'BookmeterTopBooksRoute';

BookmeterTopBooksRoute.route = {
  path: BOOKMETER_TOP_BOOKS_PATH,
};

BookmeterTopBooksRoute.getInitialProps = async (attrs) => {
  const {layoutData} = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
    },
  );

  return {
    layoutData,
  } as BookmeterTopBooksRouteViewData;
};
