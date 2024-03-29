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
  CheckboxExpandableListProps,
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

  const renderBucketGroup = (
    name: string,
    agg: APICountedBucket<any>,
    showSearch: boolean = true,
  ) => {
    if (!agg || !R.isNil(overrideFilters[name]))
      return null;

    const inputProps = l.input(name);
    const onRequestChunk: CheckboxExpandableListProps<any>['onRequestChunk'] = async (
      {
        totalLoaded,
        expandBy,
        filters: groupFilters,
      },
    ) => {
      const result = await api.repo.books.findBooksAggsItems(
        {
          agg: {
            name,
            phrase: groupFilters?.phrase,
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

      if (!result?.agg) {
        return {
          items: [],
          total: 0,
        };
      }

      return {
        items: mapCountedRecordsToCountedListItems(result.agg.items),
        total: result.agg.total?.bucket || 0,
      };
    };

    const totalBucketItems = agg.total.bucket;
    if (totalBucketItems <= 1)
      return null;

    return (
      <CachedRender cacheKey={agg}>
        {() => (
          <FiltersGroup
            header={
              t(`${name}.header`)
            }
            total={
              t(`${name}.total`, [totalBucketItems])
            }
          >
            <CheckboxExpandableList
              resetKey={agg}
              listComponent={CountedCheckboxList}
              totalItems={totalBucketItems}
              firstChunk={
                mapCountedRecordsToCountedListItems(agg.items)
              }
              checkboxListProps={
                () => inputProps
              }
              {...showSearch && {
                renderHeaderFn: ({filtersLink}) => (
                  <li className='mb-3'>
                    <FiltersPhraseSearchInput
                      placeholder={
                        t('shared.placeholders.filter')
                      }
                      {...filtersLink.input(
                        'phrase',
                        {
                          deleteFromParentIf: (inputValue) => !inputValue,
                        },
                      )}
                    />
                  </li>
                ),
              }}
              onRequestChunk={onRequestChunk}
            />
          </FiltersGroup>
        )}
      </CachedRender>
    );
  };

  return (
    <>
      {renderBucketGroup('authors', authors)}
      {renderBucketGroup('categories', categories)}

      {!overrideFilters.price && (
        <FiltersGroup header={t('price.header')}>
          <PriceRange {...l.input('price')} />
        </FiltersGroup>
      )}

      {!overrideFilters.types && types?.items.length > 1 && (
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

      {!overrideFilters.schoolLevels && schoolLevels?.items.length > 1 && (
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

      {renderBucketGroup('era', era, false)}
      {renderBucketGroup('genre', genre, false)}
      {renderBucketGroup('prizes', prizes)}
    </>
  );
};

BooksFiltersGroups.displayName = 'BooksFiltersGroups';
