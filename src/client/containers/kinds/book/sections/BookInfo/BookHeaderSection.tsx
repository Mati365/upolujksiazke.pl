import React from 'react';

import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';

import {BookFullInfoRecord} from '@api/types/BookFullInfo.record';
import {RatingsRow} from '@client/containers/controls/RatingsRow';
import {AuthorLink} from '@client/routes/Links';
import {LinksRow} from '@client/components/ui';

import {BookHeaderAttribute} from './BookHeaderAttribute';
import {BookCoverGallery} from './BookCoverGallery';
import {BookPriceBox} from './BookPriceBox';
import {BookSeriesTree} from './trees';

type BookHeaderSectionProps = {
  book: BookFullInfoRecord,
  formattedTitle: string,
};

export const BookHeaderSection = ({book, formattedTitle}: BookHeaderSectionProps) => {
  const t = useI18n();
  const ua = useUA();
  const {authors, avgRating, totalRatings} = book;

  const info = (
    <>
      <h1 className='c-book-info-section__header'>
        {formattedTitle}
      </h1>

      <div className='c-book-info-section__attrs'>
        {authors.length > 0 && (
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
        )}

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
            textOnly={ua.mobile}
            truncateRatingsCount={Infinity}
            showTextValue
          />
        </BookHeaderAttribute>
      </div>
    </>
  );

  if (ua.mobile) {
    return (
      <>
        <BookCoverGallery
          className='c-book-info-section__cover'
          primaryAlt={formattedTitle}
          book={book}
          layout='grid'
        />
        <div className='c-book-info-section__toolbar-row'>
          {info}

          <BookPriceBox
            book={book}
            small
          />
        </div>

        {book.hierarchy?.length > 0 && (
          <BookHeaderAttribute
            className='c-book-info-section__volumes'
            label={
              `${t('book.volumes')}:`
            }
          >
            <BookSeriesTree
              size='small'
              activeBookId={book.id}
              items={book.hierarchy}
            />
          </BookHeaderAttribute>
        )}
      </>
    );
  }

  return info;
};

BookHeaderSection.displayName = 'BookHeaderSection';
