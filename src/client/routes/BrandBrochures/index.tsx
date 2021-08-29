import React from 'react';
import {Redirect} from 'react-router-dom';

import {capitalize, objPropsToPromise} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {BrandRecord, BrochureCardRecord} from '@api/types';
import {RecentBrandBrochuresSection} from '@client/containers/kinds/brochure';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';
import {Breadcrumbs} from '@client/containers/kinds/breadcrumbs';
import {Container} from '@client/components/ui';
import {
  Layout,
  LayoutViewData,
  SEOMeta,
} from '@client/containers/layout';

import {
  genBrochuresLink,
  genBrandBrochuresLink,
  HOME_PATH,
  BRAND_BROCHURES_PATH,
} from '../Links';

type BrandBrochuresRouteData = {
  layoutData: LayoutViewData,
  brand: BrandRecord,
  recentBrandBrochures: BrochureCardRecord[],
};

export const BrandBrochuresRoute: AsyncRoute<BrandBrochuresRouteData> = (
  {
    layoutData,
    brand,
    recentBrandBrochures,
  },
) => {
  const t = useI18n('routes.brand_brochures');
  if (!brand)
    return <Redirect to={HOME_PATH} />;

  const breadcrumbs = (
    <Breadcrumbs
      padding='medium'
      items={[
        {
          id: 'brochures',
          path: genBrochuresLink(),
          title: t('shared.breadcrumbs.brochures'),
        },
        {
          id: 'brand',
          path: genBrandBrochuresLink(brand),
          title: capitalize(brand.name),
        },
      ]}
    />
  );

  return (
    <Layout {...layoutData}>
      <SEOMeta
        meta={{
          title: t('seo.title', [brand.name]),
          description: t('seo.description', [brand.name]),
        }}
      />

      <Container className='c-brochures-brand-route'>
        {breadcrumbs}

        <RecentBrandBrochuresSection
          headerTag='h1'
          spaced={2}
          items={recentBrandBrochures}
          brand={brand}
        />
      </Container>
    </Layout>
  );
};

BrandBrochuresRoute.displayName = 'BrandBrochuresRoute';

BrandBrochuresRoute.route = {
  path: BRAND_BROCHURES_PATH,
};

BrandBrochuresRoute.getInitialProps = async (attrs) => {
  const {api: {repo}, match} = attrs;
  const brandId = match.params.id;

  return objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      brand: repo.brands.findOne(brandId),
      recentBrandBrochures: repo.brochures.findRecentBrochures(
        {
          limit: 21,
          brandsIds: [brandId],
        },
      ),
    },
  ) as any;
};
