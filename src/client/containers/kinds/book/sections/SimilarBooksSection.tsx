import React from 'react';

import {useI18n} from '@client/i18n';

import {Section} from '@client/components/ui';
import {BookCardRecord} from '@api/types';
import {BooksGrid} from '../grids/BooksGrid';

type SimilarBooksSectionProps = {
  items: BookCardRecord[],
};

export const SimilarBooksSection = ({items}: SimilarBooksSectionProps): any => {
  const t = useI18n();

  return (
    <Section
      id='similar'
      className='c-lazy-book-section'
      title={
        t('book.similar_books')
      }
    >
      <BooksGrid items={items} />
    </Section>
  );
};

SimilarBooksSection.displayName = 'SimilarBooksSection';
