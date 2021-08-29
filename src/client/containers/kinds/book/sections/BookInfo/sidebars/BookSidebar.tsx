import React from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

import {
  CleanList,
  SidebarSection,
} from '@client/components/ui';

import {BookFullInfoRecord} from '@api/types';
import {BookCoverGallery} from '../BookCoverGallery';
import {
  BookSeriesTree,
  BookReleasesList,
} from '../trees';

export type BookSidebarProps = {
  book: BookFullInfoRecord,
  formattedTitle: string,
  className?: string,
};

export const BookSidebar = (
  {
    book,
    formattedTitle,
    className,
  }: BookSidebarProps,
) => {
  const t = useI18n();

  return (
    <CleanList
      className={c(
        'c-book-info-section__sidebar',
        className,
      )}
      inline={false}
      block
    >
      <BookCoverGallery
        tag='li'
        className='c-book-info-section__cover has-no-divider'
        primaryAlt={formattedTitle}
        book={book}
      />

      {book.hierarchy?.length > 0 && (
        <SidebarSection
          tag='li'
          className='c-book-info-section__volumes'
          title={
            `${t('book.volumes')}:`
          }
        >
          <BookSeriesTree
            size='small'
            activeBookId={book.id}
            items={book.hierarchy}
          />
        </SidebarSection>
      )}

      {book.releases?.length > 0 && (
        <SidebarSection
          tag='li'
          className='c-book-info-section__releases'
          title={
            `${t('book.releases')}:`
          }
        >
          <BookReleasesList
            size='small'
            book={book}
          />
        </SidebarSection>
      )}
    </CleanList>
  );
};

BookSidebar.displayName = 'BookSidebar';
