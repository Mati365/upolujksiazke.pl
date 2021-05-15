import React from 'react';

import {useI18n} from '@client/i18n';

import {Button, Section} from '@client/components/ui';
import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {BookCategoryLink} from '@client/routes/Links';
import {BooksGrid} from '../grids/BooksGrid';

type CategoriesGroupsBooksProps = {
  items: CategoryBooksGroup[],
};

export const CategoriesGroupsBooksSection = ({items: groups}: CategoriesGroupsBooksProps): any => {
  const t = useI18n();

  return groups.map(
    ({category, items}) => (
      <Section
        key={category.id}
        className='c-lazy-book-section'
        headerClassName='has-double-link-chevron'
        title={(
          <BookCategoryLink
            hoverUnderline={false}
            item={category}
          >
            {category.name}
          </BookCategoryLink>
        )}
      >
        <BooksGrid items={items} />

        <div className='c-flex-center mt-6'>
          <Button
            className='is-text-semibold is-text-small has-double-link-chevron'
            type='primary'
            tag={BookCategoryLink}
            item={category}
            outlined
          >
            {t('shared.buttons.more')}
          </Button>
        </div>
      </Section>
    ),
  );
};

CategoriesGroupsBooksSection.displayName = 'CategoriesGroupsBooksSection';
