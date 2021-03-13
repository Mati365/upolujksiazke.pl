import React from 'react';

import {Section} from '@client/components/ui';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {BooksGrid} from '../grids/BooksGrid';

type RecentCategoriesBooksProps = {
  items: CategoryBooksGroup[],
};

export const RecentCategoriesBooks = ({items: groups}: RecentCategoriesBooksProps): any => groups.map(
  ({category, items}) => (
    <Section
      key={category.id}
      title={category.name}
      headerClassName='has-double-link-chevron'
    >
      <BooksGrid items={items} />
    </Section>
  ),
);

RecentCategoriesBooks.displayName = 'RecentCategoriesBooks';
