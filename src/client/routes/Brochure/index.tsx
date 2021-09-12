import React, {useMemo} from 'react';
import {Redirect} from 'react-router-dom';

import {useI18n} from '@client/i18n';

import {
  capitalize,
  formatDate,
  objPropsToPromise,
} from '@shared/helpers';

import {
  HOME_PATH,
  BROCHURE_PATH,
  BrandBrochuresLink,
} from '@client/routes/Links';

import {Container, Section, SectionMore} from '@client/components/ui';
import {BrochureCardRecord, BrochureRecord} from '@api/types';
import {AsyncRoute} from '@client/components/utils/asyncRouteUtils';

import {RecentBrandBrochuresSection} from '@client/containers/kinds/brochure';
import {Header, LayoutViewData, Layout, SEOMeta} from '@client/containers/layout';
import {Viewer, ViewerStateInitializer} from '@client/modules/viewer';
import {BrochureInfo} from './BrochureInfo';

export type BrochureRouteViewData = {
  layoutData: LayoutViewData,
  brochure: BrochureRecord,
  recentBrandBrochures: BrochureCardRecord[],
};

export const BrochureRoute: AsyncRoute<BrochureRouteViewData> = (
  {
    brochure,
    layoutData,
    recentBrandBrochures,
  },
) => {
  const t = useI18n('routes.brochure');
  const brochureViewerState = useMemo<ViewerStateInitializer>(
    () => ({
      brochure,
    }),
    [],
  );

  if (!brochure)
    return <Redirect to={HOME_PATH} />;

  const {brand, title, valid} = brochure;
  const translatorAttrs = {
    title,
    brand: capitalize(brand.name),
    from: formatDate(valid.from),
    to: formatDate(valid.to),
  };

  return (
    <>
      <SEOMeta
        meta={{
          title: t('seo.title', translatorAttrs),
          description: t('seo.description', translatorAttrs),
          cover: {
            url: brochure.pages[0].image.preview.file,
          },
        }}
      />

      <section className='c-viewer-section'>
        <Header hideMobileMenu />
        <Viewer initialState={brochureViewerState} />
      </section>

      <Layout
        {...layoutData}
        hideHeader
        noLayoutSpace
      >
        <BrochureInfo brochure={brochure} />

        <Section spaced={3}>
          <Container className='c-sections-list'>
            <RecentBrandBrochuresSection
              items={recentBrandBrochures}
              brand={brand}
            >
              <SectionMore
                tag={BrandBrochuresLink}
                item={brand}
              />
            </RecentBrandBrochuresSection>
          </Container>
        </Section>
      </Layout>
    </>
  );
};

BrochureRoute.displayName = 'BrochureRoute';

BrochureRoute.route = {
  path: BROCHURE_PATH,
  exact: true,
};

BrochureRoute.getInitialProps = async (attrs) => {
  const {api: {repo}, match} = attrs;
  const {brochure, ...data} = await objPropsToPromise(
    {
      layoutData: Layout.getInitialProps(attrs),
      brochure: repo.brochures.findOne(match.params.id),
    },
  ) as any;

  return {
    ...data,
    brochure,
    recentBrandBrochures: await repo.brochures.findRecentBrochures(
      {
        limit: 14,
        excludeIds: [brochure.id],
        brandsIds: [brochure.brand.id],
      },
    ),
  };
};
