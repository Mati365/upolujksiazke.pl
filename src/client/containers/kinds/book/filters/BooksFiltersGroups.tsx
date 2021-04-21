import React from 'react';

import {useI18n} from '@client/i18n';
import {
  FiltersGroup,
  CountedCheckboxList,
} from '@client/containers/filters';

export const BooksFiltersGroups = () => {
  const t = useI18n('book.filters');

  return (
    <>
      <FiltersGroup header={t('categories.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('price.header')}>
        ABC
      </FiltersGroup>

      <FiltersGroup header={t('authors.header')}>
        <CountedCheckboxList
          value={{
            1: true,
          }}
          items={[
            {
              id: 1,
              name: 'Dupa',
              count: 199,
            },
            {
              id: 2,
              name: 'Dupa 2',
              count: 55,
            },
          ]}
        />
      </FiltersGroup>

      <FiltersGroup header={t('publisher.header')}>
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
