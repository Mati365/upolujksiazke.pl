import React from 'react';

import {ICON_BY_NAME} from '@client/components/svg';

import {LogoListItem} from '@client/containers/parts';
import {BookCategoryLink} from '@client/routes/Links';
import {CategoryCardProps} from './CategoryCard';

export const CategoryListItemCard = ({className, item}: CategoryCardProps) => {
  const Icon = ICON_BY_NAME[item.icon];

  return (
    <LogoListItem
      className={className}
      linkComponent={BookCategoryLink}
      item={item}
      icon={(
        Icon && (
          <Icon />
        )
      )}
    />
  );
};

CategoryListItemCard.displayName = 'CategoryListItemCard';
