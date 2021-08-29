import React, {Fragment, useMemo} from 'react';
import * as R from 'ramda';

import {findById} from '@shared/helpers';

import {Divider} from '@client/components/ui';
import {BooksAuthorsGroupedBooks} from '@api/repo';
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
  authorsBooks?: BooksAuthorsGroupedBooks,
};

export const BookPriceSidebar = ({book, authorsBooks}: BookPriceSidebarProps) => {
  const {tags, authors} = book;
  const groupedAuthorsBooks = useMemo(
    () => (
      R
        .toPairs(authorsBooks)
        .map(
          ([authorId, card]) => [
            findById(+authorId)(authors),
            card,
          ],
        )
        .filter(([, books]) => (books as any[])?.length > 0)
    ) as [BookAuthorRecord, BookCardRecord[]][],
    [authorsBooks],
  );

  return (
    <BookPriceBox
      className='c-book-info-section__price-box'
      book={book}
    >
      {groupedAuthorsBooks.length > 0 && (
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
