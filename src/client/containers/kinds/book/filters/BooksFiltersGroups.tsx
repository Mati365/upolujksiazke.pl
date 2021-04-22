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

      {aggs.types && (
        <FiltersGroup header={t('types.header')}>
          <CountedCheckboxList
            items={
              aggs.types.map(
                ({record: type, count}) => ({
                  id: type,
                  name: t(`shared.book.types.${type}`),
                  count,
                }),
              )
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

      {aggs.era && (
        <FiltersGroup header={t('era.header')}>
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(aggs.era)
            }
          />
        </FiltersGroup>
      )}

      {aggs.genre && (
        <FiltersGroup header={t('genre.header')}>
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(aggs.genre)
            }
          />
        </FiltersGroup>
      )}

      {aggs.prizes && (
        <FiltersGroup header={t('prize.header')}>
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(aggs.prizes)
            }
          />
        </FiltersGroup>
      )}

      <FiltersGroup header={t('price.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('school_book.header')}>
        ABC
      </FiltersGroup>
    </>
  );
};

BooksFiltersGroups.displayName = 'BooksFiltersGroups';
