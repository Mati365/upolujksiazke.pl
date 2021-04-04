import React, {ReactNode} from 'react';

import {formatBookTitle} from '@client/helpers/logic';

import {useUA} from '@client/modules/ua';
import {useI18n} from '@client/i18n';

import {BookCardRecord, BookFullInfoRecord} from '@api/types';
import {RatingsRow} from '@client/containers/parts/RatingsRow';
import {
  AuthorLink,
  CategoryLink,
} from '@client/routes/Links';

import {
  ExpandableDescriptionBox,
  Divider,
  Section,
  LinksRow,
} from '@client/components/ui';

import {BookPriceBox} from './BookPriceBox';
import {BookProperties} from './BookProperties';
import {BookHeaderAttribute} from './BookHeaderAttribute';
import {BookTags} from './BookTags';
import {BookSidebar} from './Desktop/BookSidebar';
import {AuthorOtherBooks} from './AuthorOtherBooks';

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
    primaryRelease, authors, categories,
    avgRating, totalRatings, tags,
  } = book;

  const formattedTitle = formatBookTitle(
    {
      t,
      book,
    },
  );

  return (
    <Section
      spaced={3}
      className='c-book-info-section'
    >
      {ua.desktop && (
        <BookSidebar
          book={book}
          formattedTitle={formattedTitle}
        />
      )}

      <div className='c-book-info-section__info'>
        <h1 className='c-book-info-section__header'>
          {formattedTitle}
        </h1>

        <BookHeaderAttribute
          className='c-book-info-section__author'
          label={
            `${t('book.created_by')}:`
          }
        >
          <LinksRow
            items={authors}
            linkComponent={AuthorLink}
            linkProps={{
              underline: true,
            }}
            block={false}
            separated
          />
        </BookHeaderAttribute>

        <BookHeaderAttribute
          className='c-book-info-section__ratings'
          label={
            `${t('shared.titles.rating')}:`
          }
        >
          <RatingsRow
            size='big'
            value={avgRating / 10}
            totalStars={10}
            totalRatings={totalRatings}
          />
        </BookHeaderAttribute>

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
          html
        />

        <Divider />

        <BookProperties book={book} />

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

        {children}
      </div>

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
    </Section>
  );
};

BookInfo.displayName = 'BookInfo';
