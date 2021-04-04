import React from 'react';

import {useI18n} from '@client/i18n';

import {
  Divider,
  SidebarSection,
} from '@client/components/ui';

import {BookFullInfoRecord} from '@api/types';
import {BookCoverGallery} from '../BookCoverGallery';
import {BookSeriesTree} from '../BookSeriesTree';
import {BookReleasesList} from '../BookReleasesList';

type BookSidebarProps = {
  book: BookFullInfoRecord,
  formattedTitle: string,
};

export const BookSidebar = ({book, formattedTitle}: BookSidebarProps) => {
  const t = useI18n();

  return (
    <div className='c-book-info-section__sidebar'>
      <BookCoverGallery
        className='c-book-info-section__cover'
        primaryAlt={formattedTitle}
        book={book}
      />

      {book.hierarchy?.length > 0 && (
        <SidebarSection
          className='c-book-info-section__volumes'
          title={
            `${t('book.volumes')}:`
          }
        >
          <BookSeriesTree
            activeBookId={book.id}
            items={book.hierarchy}
          />
        </SidebarSection>
      )}

      {book.releases?.length > 0 && (
        <>
          {book.hierarchy?.length > 0 && (
            <Divider />
          )}

          <SidebarSection
            className='c-book-info-section__releases'
            title={
              `${t('book.releases')}:`
            }
          >
            <BookReleasesList book={book} />
          </SidebarSection>
        </>
      )}
    </div>
  );
};

BookSidebar.displayName = 'BookSidebar';
