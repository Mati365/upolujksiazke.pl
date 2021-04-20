import React, {Fragment, useMemo} from 'react';
import * as R from 'ramda';

import {Divider} from '@client/components/ui';
import {
  BookAuthorRecord,
  BookCardRecord,
  BookFullInfoRecord,
} from '@api/types';

import {BookPriceBox} from '../BookPriceBox';
import {AuthorOtherBooks} from '../AuthorOtherBooks';
import {BookTags} from '../BookTags';

type BookPriceSidebarProps = {
  book: BookFullInfoRecord,
  authorsBooks?: BookCardRecord[],
};

export const BookPriceSidebar = ({book, authorsBooks}: BookPriceSidebarProps) => {
  const {tags} = book;
  const groupedAuthorsBooks = useMemo(
    () => {
      const groupedBooks: [BookAuthorRecord, BookCardRecord[]][] = [];
      const stack = [...authorsBooks];

      book.authors.forEach((author) => {
        const authorBooks: BookCardRecord[] = [];

        for (let i = 0; i < stack.length;) {
          const stackBook = stack[i];

          if (R.any(({id}) => id === author.id, stackBook.authors)) {
            authorBooks.push(stackBook);
            stack.splice(i, 1);
          } else
            ++i;
        }

        if (authorBooks.length)
          groupedBooks.push([author, authorBooks]);
      });

      return groupedBooks;
    },
    [authorsBooks],
  );

  return (
    <BookPriceBox
      className='c-book-info-section__price-box'
      book={book}
    >
      {groupedAuthorsBooks?.length > 0 && (
        <>
          {groupedAuthorsBooks.map(
            ([author, books], index) => (
              <Fragment key={author.id}>
                <AuthorOtherBooks
                  author={author}
                  books={books}
                />

                {index + 1 < groupedAuthorsBooks.length && (
                  <Divider />
                )}
              </Fragment>
            ),
          )}
          <Divider />
        </>
      )}

      {tags.length > 0 && (
        <BookTags tags={book.tags} />
      )}
    </BookPriceBox>
  );
};

BookPriceSidebar.displayName = 'BookPriceSidebar';
