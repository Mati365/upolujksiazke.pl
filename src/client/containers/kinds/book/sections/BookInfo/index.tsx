import React, {ReactNode} from 'react';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {BookFullInfoRecord} from '@api/types';
import {AnchorIcon} from '@client/components/svg';
import {RatingsRow} from '@client/containers/parts/RatingsRow';
import {
  AuthorLink,
  CategoryLink,
} from '@client/routes/Links';

import {TagsList} from '@client/containers/controls/TagsList';
import {
  ExpandableDescriptionBox,
  Divider,
  Section,
  LinksRow,
  SidebarSection,
} from '@client/components/ui';

import {BookPriceBox} from './BookPriceBox';
import {BookProperties} from './BookProperties';
import {BookHeaderAttribute} from './BookHeaderAttribute';
import {BookCoverGallery} from './BookCoverGallery';
import {BookSeriesTree} from './BookSeriesTree';
import {BookReleasesList} from './BookReleasesList';

type BookInfoProps = {
  book: BookFullInfoRecord,
  children?: ReactNode,
};

export const BookInfo = ({book, children}: BookInfoProps) => {
  const t = useI18n();
  const {
    id, taggedDescription, description,
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
              activeBookId={id}
              items={book.hierarchy}
            />
          </SidebarSection>
        )}

        {book.releases?.length > 0 && (
          <SidebarSection
            className='c-book-info-section__releases'
            title={
              `${t('book.releases')}:`
            }
          >
            <BookReleasesList book={book} />
          </SidebarSection>
        )}
      </div>

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

      <BookPriceBox book={book}>
        {tags.length > 0 && (
          <div className='c-book-info-section__tags'>
            <div className='c-book-info-section__tags-title is-text-muted is-text-small'>
              <AnchorIcon className='mr-2' />
              {`${t('shared.titles.keywords')}:`}
            </div>

            <TagsList items={tags} />
          </div>
        )}
      </BookPriceBox>
    </Section>
  );
};

BookInfo.displayName = 'BookInfo';
