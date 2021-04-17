import React, {ReactNode} from 'react';

import {formatBookTitle} from '@client/helpers/logic';

import {useUA} from '@client/modules/ua';
import {useI18n} from '@client/i18n';

import {BookCardRecord, BookFullInfoRecord} from '@api/types';
import {CategoryLink} from '@client/routes/Links';

import {
  ExpandableDescriptionBox,
  Divider,
  Section,
  LinksRow,
} from '@client/components/ui';

import {BookTags} from './BookTags';
import {BookProperties} from './BookProperties';
import {BookHeaderAttribute} from './BookHeaderAttribute';
import {BookSchoolInfo} from './BookSchoolInfo';
import {BookHeaderSection} from './BookHeaderSection';
import {
  BookSidebar,
  BookPriceSidebar,
} from './sidebars';

type BookInfoProps = {
  book: BookFullInfoRecord,
  authorsBooks?: BookCardRecord[],
  children?: ReactNode,
};

export const BookInfo = ({book, authorsBooks, children}: BookInfoProps) => {
  const t = useI18n();
  const ua = useUA();
  const {
    taggedDescription, description,
    primaryRelease, categories,
    schoolBook, tags,
  } = book;

  const formattedTitle = formatBookTitle(
    {
      t,
      book,
    },
  );

  console.info(book);

  return (
    <Section
      spaced={2}
      className='c-book-info-section'
    >
      {ua.desktop && (
        <BookSidebar
          book={book}
          formattedTitle={formattedTitle}
        />
      )}

      <div className='c-book-info-section__info'>
        <BookHeaderSection
          book={book}
          formattedTitle={formattedTitle}
        />

        <h2 className='c-book-info-section__description-header'>
          {t('book.book_description')}
        </h2>

        <ExpandableDescriptionBox
          maxCharactersCount={900}
          text={(
            taggedDescription
              || description
              || primaryRelease.description
              || t('book.no_description')
          )}
          mobileSmaller={false}
          html
        />

        {schoolBook && (
          <>
            <Divider
              spaced={1}
              noBorder
            />

            <h2 className='c-book-info-section__description-header'>
              {t('book.about_school_book')}
            </h2>

            <BookSchoolInfo book={book} />
          </>
        )}

        <Divider />

        <BookProperties book={book} />

        {categories.length > 0 && (
          <BookHeaderAttribute
            className='c-book-info-section__categories'
            label={
              `${t('shared.titles.categories')}:`
            }
          >
            <LinksRow
              className='is-text-small'
              items={categories}
              linkComponent={CategoryLink}
              linkProps={{
                underline: true,
              }}
              block={false}
              separated
            />
          </BookHeaderAttribute>
        )}

        {ua.mobile && tags.length > 0 && (
          <BookTags tags={book.tags} />
        )}

        {children}
      </div>

      {ua.desktop && (
        <BookPriceSidebar
          book={book}
          authorsBooks={authorsBooks}
        />
      )}
    </Section>
  );
};

BookInfo.displayName = 'BookInfo';
