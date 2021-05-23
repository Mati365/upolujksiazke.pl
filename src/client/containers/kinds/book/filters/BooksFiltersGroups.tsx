import React from 'react';
import * as R from 'ramda';

import {mapCountedRecordsToCountedListItems} from '@api/helpers/mapCountedRecordsToCountedListItems';
import {useI18n} from '@client/i18n';
import {useAjaxAPIClient} from '@client/modules/api/client/hooks/useAjaxAPIClient';

import {LinkProps} from '@client/decorators/linkInput';
import {BookCountedAggs} from '@api/repo';

import {APICountedBucket} from '@api/APIRecord';
import {CachedRender} from '@client/components/functional';

import {
  CheckboxExpandableList,
  PriceRange,
} from '@client/components/ui/controls';

import {
  CountedCheckboxList,
  FiltersGroup,
  FiltersPhraseSearchInput,
} from '@client/containers/filters';

import {serializeAggsToSearchParams} from './helpers/serializeAggsToSearchParams';

type BooksFiltersGroupsProps = LinkProps<Partial<any>> & {
  aggs: BookCountedAggs,
  overrideFilters?: any,
};

export const BooksFiltersGroups = (
  {
    aggs,
    l,
    overrideFilters = {},
  }: BooksFiltersGroupsProps,
) => {
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
    schoolLevels,
  } = aggs;

  const renderBucketGroup = (name: string, agg: APICountedBucket<any>) => {
    if (!agg || !R.isNil(overrideFilters[name]))
      return null;

    const inputProps = l.input(name);
    return (
      <CachedRender cacheKey={agg}>
        {() => (
          <FiltersGroup
            header={
              t(`${name}.header`)
            }
            total={
              t(`${name}.total`, [agg.total.bucket])
            }
          >
            <CheckboxExpandableList
              resetKey={agg}
              listComponent={CountedCheckboxList}
              totalItems={agg.total.bucket}
              firstChunk={
                mapCountedRecordsToCountedListItems(agg.items)
              }
              checkboxListProps={
                () => inputProps
              }
              onRequestChunk={
                async ({totalLoaded, expandBy}) => {
                  const result = await api.repo.books.findBooksAggsItems(
                    {
                      agg: {
                        name,
                        pagination: {
                          offset: totalLoaded,
                          limit: expandBy,
                        },
                      },
                      filters: serializeAggsToSearchParams(
                        {
                          ...l.value,
                          ...overrideFilters,
                        },
                      ),
                    },
                  );

                  return mapCountedRecordsToCountedListItems(result?.items);
                }
              }
            />
          </FiltersGroup>
        )}
      </CachedRender>
    );
  };

  return (
    <>
      {!overrideFilters.phrase && (
        <FiltersPhraseSearchInput
          placeholder={
            t('phrase.placeholder')
          }
          {...l.input(
            'phrase',
            {
              deleteFromParentIf: (inputValue) => !inputValue,
            },
          )}
        />
      )}

      {renderBucketGroup('authors', authors)}
      {renderBucketGroup('categories', categories)}

      {!overrideFilters.price && (
        <FiltersGroup header={t('price.header')}>
          <PriceRange {...l.input('price')} />
        </FiltersGroup>
      )}

      {!overrideFilters.types && types?.items.length > 0 && (
        <FiltersGroup
          header={t('types.header')}
          total={t('types.total', [types.total.bucket])}
        >
          <CountedCheckboxList
            {...l.input('types')}
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

      {!overrideFilters.schoolLevels && schoolLevels?.items.length > 0 && (
        <FiltersGroup header={t('school_levels.header')}>
          <CountedCheckboxList
            {...l.input('schoolLevels')}
            items={
              schoolLevels.items.map(
                ({record: type, count}) => ({
                  id: type,
                  name: t(`shared.book.classLevel.${type}`),
                  count,
                }),
              )
            }
          />
        </FiltersGroup>
      )}

      {renderBucketGroup('era', era)}
      {renderBucketGroup('genre', genre)}
      {renderBucketGroup('prizes', prizes)}
    </>
  );
};

BooksFiltersGroups.displayName = 'BooksFiltersGroups';
