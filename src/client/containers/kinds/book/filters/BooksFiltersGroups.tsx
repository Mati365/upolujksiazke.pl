import React from 'react';

import {useI18n} from '@client/i18n';
import {mapCountedRecordsToCountedListItems} from '@client/modules/api/helpers/mapCountedRecordsToCountedListItems';

import {BookAggs} from '@api/repo';
import {
  FiltersGroup,
  CountedCheckboxList,
} from '@client/containers/filters';

type BooksFiltersGroupsProps = {
  aggs: BookAggs,
};

export const BooksFiltersGroups = ({aggs}: BooksFiltersGroupsProps) => {
  const t = useI18n('book.filters');

  return (
    <>
      {aggs.categories && (
        <FiltersGroup header={t('categories.header')}>
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(aggs.categories)
            }
          />
        </FiltersGroup>
      )}

      {aggs.authors && (
        <FiltersGroup header={t('authors.header')}>
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(aggs.authors)
            }
          />
        </FiltersGroup>
      )}

      {aggs.publishers && (
        <FiltersGroup header={t('publisher.header')}>
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(aggs.publishers)
            }
          />
        </FiltersGroup>
      )}

      <FiltersGroup header={t('price.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('types.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('era.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('genre.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('school_book.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('prizes.header')}>
        ABC
      </FiltersGroup>
    </>
  );
};

BooksFiltersGroups.displayName = 'BooksFiltersGroups';
