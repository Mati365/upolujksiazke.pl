import React from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

import {
  CleanList,
  SidebarSection,
} from '@client/components/ui';

import {BookFullInfoRecord} from '@api/types';
import {BookCoverGallery} from '../BookCoverGallery';
import {BookTags} from '../BookTags';
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
  const {hierarchy, releases, tags} = book;

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

      {hierarchy?.length > 0 && (
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
            items={hierarchy}
          />
        </SidebarSection>
      )}

      {releases?.length > 0 && (
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

      {tags.length > 0 && (
        <BookTags tags={book.tags} />
      )}
    </CleanList>
  );
};

BookSidebar.displayName = 'BookSidebar';
