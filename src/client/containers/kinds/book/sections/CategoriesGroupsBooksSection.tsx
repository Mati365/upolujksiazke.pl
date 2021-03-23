import React from 'react';

import {Section} from '@client/components/ui';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {BooksGrid} from '../grids/BooksGrid';

type CategoriesGroupsBooksProps = {
  items: CategoryBooksGroup[],
};

export const CategoriesGroupsBooksSection = ({items: groups}: CategoriesGroupsBooksProps): any => groups.map(
  ({category, items}) => (
    <Section
      key={category.id}
      title={category.name}
      className='c-lazy-book-section'
      headerClassName='has-double-link-chevron'
    >
      <BooksGrid items={items} />
    </Section>
  ),
);

CategoriesGroupsBooksSection.displayName = 'CategoriesGroupsBooksSection';
