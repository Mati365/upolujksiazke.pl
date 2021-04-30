import React from 'react';

import {useI18n} from '@client/i18n';
import {mapCountedRecordsToCountedListItems} from '@client/modules/api/helpers/mapCountedRecordsToCountedListItems';
import {useAjaxAPIClient} from '@client/modules/api/client/hooks/useAjaxAPIClient';

import {BookAggs} from '@api/repo';
import {APICountedBucket} from '@api/APIRecord';
import {CheckboxExpandableList} from '@client/components/ui/controls';
import {
  FiltersGroup,
  CountedCheckboxList,
} from '@client/containers/filters';

type BooksFiltersGroupsProps = {
  aggs: BookAggs,
};

export const BooksFiltersGroups = ({aggs}: BooksFiltersGroupsProps) => {
  const api = useAjaxAPIClient();
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

  const renderBucketGroup = (name: string, agg: APICountedBucket<any>) => {
    if (!agg)
      return null;

    return (
      <FiltersGroup
        header={
          t(`${name}.header`)
        }
        total={
          t(`${name}.total`, [agg.total.bucket])
        }
      >
        <CheckboxExpandableList
          listComponent={CountedCheckboxList}
          totalItems={agg.total.bucket}
          firstChunk={
            mapCountedRecordsToCountedListItems(agg.items)
          }
          onRequestChunk={
            async ({totalLoaded, defaultChunkSize}) => {
              const result = await api.repo.books.findBooksAggsItems(
                {
                  agg: {
                    name,
                    pagination: {
                      offset: totalLoaded,
                      limit: defaultChunkSize,
                    },
                  },
                  filters: {},
                },
              );

              return mapCountedRecordsToCountedListItems(result?.items);
            }
          }
        />
      </FiltersGroup>
    );
  };

  return (
    <>
      {renderBucketGroup('categories', categories)}
      {renderBucketGroup('authors', authors)}

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

      {renderBucketGroup('publishers', publishers)}
      {renderBucketGroup('era', era)}
      {renderBucketGroup('genre', genre)}
      {renderBucketGroup('prizes', prizes)}

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
