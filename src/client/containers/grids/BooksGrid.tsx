import React from 'react';
import {BookCardRecord} from '@api/types';
import {BookCard} from '../cards/BookCard';

type BooksGridProps = {
  items: BookCardRecord[],
};

export const BooksGrid = ({items}: BooksGridProps) => (
  <section className='c-books-grid'>
    {items.map(
      (book) => (
        <BookCard
          key={book.id}
          item={book}
        />
      ),
    )}
  </section>
);

BooksGrid.displayName = 'BooksGrid';
