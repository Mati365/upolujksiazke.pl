import React from 'react';

import {Section} from '@client/components/ui';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {BooksLink} from '@client/routes/Links';
import {BooksGrid} from '../grids/BooksGrid';

type CategoriesGroupsBooksProps = {
  items: CategoryBooksGroup[],
};

export const CategoriesGroupsBooksSection = ({items: groups}: CategoriesGroupsBooksProps): any => groups.map(
  ({category, items}) => (
    <Section
      key={category.id}
      className='c-lazy-book-section'
      headerClassName='has-double-link-chevron'
      title={(
        <BooksLink
          hoverUnderline={false}
          item={{
            categories: [category],
          }}
        >
          {category.name}
        </BooksLink>
      )}
    >
      <BooksGrid items={items} />
    </Section>
  ),
);

CategoriesGroupsBooksSection.displayName = 'CategoriesGroupsBooksSection';
