import React from 'react';

import {objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {NewsIcon} from '@client/components/svg';

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
  NEWS_PATH,
  genNewsLink,
} from '../Links';

type NewsRouteData = {
  layoutData: LayoutViewData,
};

export const NewsRoute: AsyncRoute<NewsRouteData> = (
  {
    layoutData,
  },
) => {
  const t = useI18n('routes.news');
  const breadcrumbs = (
    <Breadcrumbs
      items={[
        {
          id: 'news',
          path: genNewsLink(),
          title: t('shared.breadcrumbs.news'),
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
          <NewsIcon className='mr-2' />
          {t('title')}
        </LayoutHeaderTitle>

        NEWS
      </Container>
    </Layout>
  );
};

NewsRoute.displayName = 'NewsRoute';

NewsRoute.route = {
  path: NEWS_PATH,
};

NewsRoute.getInitialProps = async (attrs) => {
  const {layoutData} = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
    },
  );

  return {
    layoutData,
  } as NewsRouteData;
};
