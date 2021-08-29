import React from 'react';

import {capitalize, formatDate} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {
  genBrochureLink,
  genBrochuresLink,
  genBrandBrochuresLink,
} from '@client/routes/Links';

import {BrochureRecord} from '@api/types';
import {Breadcrumbs} from '@client/containers/kinds/breadcrumbs';
import {Container, UnderlinedTitle} from '@client/components/ui';
import {BrochureCtaLink} from './BrochureCtaLink';

type BrochureTitleProps = {
  brochure: BrochureRecord,
};

export const BrochureTitle = (
  {
    brochure,
  }: BrochureTitleProps,
) => {
  const {
    url,
    brand,
    title,
    valid,
  } = brochure;

  const t = useI18n();
  const formattedTitle = t(
    'brochure.header',
    {
      brand: brand.name,
      title,
    },
  );

  const breadcrumbs = (
    <Breadcrumbs
      padding='none'
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
        {
          id: 'brochure',
          path: genBrochureLink(brochure),
          title: capitalize(formattedTitle),
        },
      ]}
    />
  );

  return (
    <div className='c-brochure-title'>
      <Container>
        {breadcrumbs}

        <div className='c-brochure-title__logo'>
          <img
            alt={brand.name}
            src={brand.logo.thumb.file}
          />
        </div>

        <div className='c-brochure-title__content'>
          <UnderlinedTitle
            tag='h1'
            className='c-brochure-title__content-header'
          >
            {formattedTitle}
          </UnderlinedTitle>

          <div className='c-brochure-title__content-duration'>
            <span className='mr-1'>
              {t('brochure.valid.label')}
            </span>

            <span>
              <strong className='is-text-primary'>
                {formatDate(valid.from)}
              </strong>

              <span className='mx-1'>
                {t('brochure.valid.to')}
              </span>

              <strong className='is-text-primary'>
                {formatDate(valid.to)}
              </strong>
            </span>
          </div>
        </div>

        <div className='c-brochure-title__toolbar'>
          <BrochureCtaLink
            href={url}
            title={
              t('brochure.see_on_website')
            }
          />
        </div>
      </Container>
    </div>
  );
};

BrochureTitle.displayName = 'BrochureTitle';
