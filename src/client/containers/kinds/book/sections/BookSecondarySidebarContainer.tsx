import React, {ReactNode} from 'react';

import {BookFullInfoRecord} from '@api/types';
import {BookSidebar} from './BookInfo/sidebars';
import {BookHeaderSection} from './BookInfo/BookHeaderSection';

type BookSecondarySidebarContainerProps = {
  children?: ReactNode,
  title: string,
  book: BookFullInfoRecord,
};

export const BookSecondarySidebarContainer = (
  {
    book,
    title,
    children,
  }: BookSecondarySidebarContainerProps,
) => (
  <div className='c-book-secondary-container'>
    <BookSidebar
      className='c-book-secondary-container__sidebar'
      book={book}
      formattedTitle={book.defaultTitle}
    />

    <div className='c-book-secondary-container__content'>
      <BookHeaderSection
        book={book}
        formattedTitle={title}
      />
      {children}
    </div>
  </div>
);

BookSecondarySidebarContainer.displayName = 'BookSecondarySidebarContainer';
