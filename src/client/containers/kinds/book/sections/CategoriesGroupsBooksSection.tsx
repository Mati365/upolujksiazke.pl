import React from 'react';

import {capitalize} from '@shared/helpers';

import {Section, SectionMore} from '@client/components/ui';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {BookCategoryLink} from '@client/routes/Links';
import {BooksGrid} from '../grids/BooksGrid';

type CategoriesGroupsBooksProps = {
  items: CategoryBooksGroup[],
};

export const CategoriesGroupsBooksSection = ({items: groups}: CategoriesGroupsBooksProps): any => groups.map(
  ({category, items}) => (
    <Section
      key={category.id}
      className='c-lazy-book-section'
      title={(
        <BookCategoryLink
          className='has-double-link-chevron'
          hoverUnderline={false}
          item={category}
        >
          {capitalize(category.name)}
        </BookCategoryLink>
      )}
    >
      <BooksGrid items={items} />
      <SectionMore
        tag={BookCategoryLink}
        item={category}
      />
    </Section>
  ),
);

CategoriesGroupsBooksSection.displayName = 'CategoriesGroupsBooksSection';
