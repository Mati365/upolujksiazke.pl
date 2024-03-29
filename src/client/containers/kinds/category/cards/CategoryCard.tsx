import React from 'react';
import c from 'classnames';

import {ICON_BY_NAME} from '@client/components/svg';

import {BookCategoryRecord} from '@api/types';
import {BookCategoryLink} from '@client/routes/Links';

export type CategoryCardProps = {
  className?: string,
  item: BookCategoryRecord,
};

export const CategoryCard = ({className, item}: CategoryCardProps) => {
  const Icon = ICON_BY_NAME[item.icon];

  return (
    <article
      className={c(
        'c-category-card',
        className,
      )}
    >
      <BookCategoryLink
        item={item}
        title={item.name}
      >
        <div className='c-category-card__content'>
          {Icon && (
            <Icon className='c-category-card__icon' />
          )}

          <span className='c-category-card__title'>
            {item.name}
          </span>
        </div>
      </BookCategoryLink>
    </article>
  );
};

CategoryCard.displayName = 'CategoryCard';
