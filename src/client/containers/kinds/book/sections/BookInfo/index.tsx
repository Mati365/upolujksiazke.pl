import React, {ReactNode} from 'react';

import {formatBookTitle} from '@client/helpers/logic';

import {useUA} from '@client/modules/ua';
import {useI18n} from '@client/i18n';

import {ListItem} from '@shared/types';
import {BookFullInfoRecord} from '@api/types';
import {BooksAuthorsGroupedBooks, BooksFiltersWithNames} from '@api/repo';
import {BookCategoryLink, BooksLink} from '@client/routes/Links';

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
  authorsBooks?: BooksAuthorsGroupedBooks,
  children?: ReactNode,
  toolbar?: ReactNode,
};

export const BookInfo = (
  {
    toolbar,
    book,
    authorsBooks,
    children,
  }: BookInfoProps,
) => {
  const t = useI18n();
  const ua = useUA();
  const {
    taggedDescription, description,
    primaryRelease, categories,
    schoolBook, tags,
    primaryCategory,
  } = book;

  const formattedTitle = formatBookTitle(
    {
      t,
      book,
    },
  );

  const safeDescription = (
    taggedDescription
      || description
      || primaryRelease.description
  );

  return (
    <Section
      className='c-book-info-section'
      spaced={0}
    >
      {ua.desktop && (
        <BookSidebar
          book={book}
          formattedTitle={formattedTitle}
        />
      )}

      <div className='c-book-info-section__info'>
        {toolbar}

        <BookHeaderSection
          book={book}
          formattedTitle={formattedTitle}
        />

        {!safeDescription ? null : (
          <>
            <h2 className='c-book-info-section__description-header'>
              {t('book.book_description')}
            </h2>

            <ExpandableDescriptionBox
              className='c-book-info-section__description'
              maxCharactersCount={(
                ua.mobile
                  ? 350
                  : 900
              )}
              text={safeDescription}
              mobileSmaller={false}
              html
            />
          </>
        )}

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

        <div className='c-book-info-section__categories'>
          {primaryCategory && (
            <BookHeaderAttribute
              label={
                `${t('book.primary_category')}:`
              }
              wrap={false}
            >
              <BookCategoryLink
                className='is-primary-chevron-link is-text-small is-text-semibold'
                item={primaryCategory}
                withChevron
              >
                {primaryCategory.name}
              </BookCategoryLink>
            </BookHeaderAttribute>
          )}

          {categories.length > 0 && (
            <BookHeaderAttribute
              label={
                `${t('shared.titles.subcategories')}:`
              }
              wrap={false}
            >
              <LinksRow<BooksFiltersWithNames>
                className='is-text-small'
                items={categories}
                linkComponent={BooksLink}
                linkProps={
                  (item) => ({
                    withChevron: true,
                    item: {
                      categories: [item as ListItem],
                    },
                  })
                }
                block={false}
                separated
              />
            </BookHeaderAttribute>
          )}
        </div>

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
