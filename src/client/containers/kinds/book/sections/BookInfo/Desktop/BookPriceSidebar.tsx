import React from 'react';

import {BookCardRecord, BookFullInfoRecord} from '@api/types';
import {Divider} from '@client/components/ui';

import {BookPriceBox} from '../BookPriceBox';
import {AuthorOtherBooks} from '../AuthorOtherBooks';
import {BookTags} from '../BookTags';

type BookPriceSidebarProps = {
  book: BookFullInfoRecord,
  authorsBooks?: BookCardRecord[],
};

export const BookPriceSidebar = ({book, authorsBooks}: BookPriceSidebarProps) => {
  const {tags} = book;

  return (
    <BookPriceBox
      className='c-book-info-section__price-box'
      book={book}
    >
      {authorsBooks?.length > 0 && (
        <>
          <AuthorOtherBooks books={authorsBooks} />
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
