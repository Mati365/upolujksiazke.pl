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
  const {
    categories,
    authors,
    types,
    publishers,
    era,
    genre,
    prizes,
  } = aggs;

  return (
    <>
      {categories && (
        <FiltersGroup
          header={t('categories.header')}
          total={t('categories.total', [categories.total.bucket])}
        >
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(categories.items)
            }
          />
        </FiltersGroup>
      )}

      {authors && (
        <FiltersGroup
          header={t('authors.header')}
          total={t('authors.total', [authors.total.bucket])}
        >
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(authors.items)
            }
          />
        </FiltersGroup>
      )}

      {types && (
        <FiltersGroup
          header={t('types.header')}
          total={t('types.total', [types.total.bucket])}
        >
          <CountedCheckboxList
            items={
              types.items.map(
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

      {publishers && (
        <FiltersGroup
          header={t('publisher.header')}
          total={t('publisher.total', [publishers.total.bucket])}
        >
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(publishers.items)
            }
          />
        </FiltersGroup>
      )}

      {era && (
        <FiltersGroup
          header={t('era.header')}
          total={t('era.total', [era.total.bucket])}
        >
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(era.items)
            }
          />
        </FiltersGroup>
      )}

      {genre && (
        <FiltersGroup
          header={t('genre.header')}
          total={t('genre.total', [genre.total.bucket])}
        >
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(genre.items)
            }
          />
        </FiltersGroup>
      )}

      {prizes && (
        <FiltersGroup
          header={t('prize.header')}
          total={t('prizes.total', [prizes.total.bucket])}
        >
          <CountedCheckboxList
            items={
              mapCountedRecordsToCountedListItems(prizes.items)
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
