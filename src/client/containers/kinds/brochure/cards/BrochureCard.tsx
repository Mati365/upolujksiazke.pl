import React from 'react';
import c from 'classnames';

import {formatDate} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {Picture} from '@client/components/ui';
import {BrochureCardRecord} from '@api/types';
import {BrochureLink, BrandBrochuresLink} from '@client/routes/Links';

type BrochureCardProps = {
  className?: string,
  item: BrochureCardRecord,
};

export const BrochureCard = ({className, item}: BrochureCardProps) => {
  const t = useI18n();
  const {title, brand, cover, valid} = item;

  if (!cover)
    return null;

  return (
    <article
      className={c(
        'c-brochure-card',
        className,
      )}
    >
      <BrochureLink
        item={item}
        hoverUnderline={false}
      >
        <Picture
          className='c-brochure-card__cover is-hover-scale'
          alt={title}
          src={cover.thumb.file}
        />
      </BrochureLink>

      <div className='c-brochure-card__toolbar'>
        <BrandBrochuresLink
          className='c-brochure-card__logo'
          item={item.brand}
          hoverUnderline={false}
        >
          <Picture
            alt={title}
            src={brand.logo.thumb.file}
          />
        </BrandBrochuresLink>

        <BrochureLink
          className='c-brochure-card__duration'
          hoverUnderline={false}
          item={item}
        >
          <strong className='is-text-semibold'>
            {formatDate(valid.from)}
          </strong>

          <span className='mx-1'>
            {t('brochure.valid.to')}
          </span>

          <strong className='is-text-semibold'>
            {formatDate(valid.to)}
          </strong>
        </BrochureLink>
      </div>
    </article>
  );
};

BrochureCard.displayName = 'BrochureCard';
