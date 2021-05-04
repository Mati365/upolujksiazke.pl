import React, {useMemo} from 'react';
import snakeCase from 'to-snake-case';
import c from 'classnames';
import * as R from 'ramda';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';
import {findKeyByValue, removeNullValues} from '@shared/helpers';
import {useI18n} from '@client/i18n';

import {CleanList, TextButton} from '@client/components/ui';
import {TimesIcon} from '@client/components/svg';

import {pickNonPaginationFilters} from './hooks/useStoreFiltersInURL';

const hasNestedObjectsValues = (nestedValue: any) => R.is(Object, nestedValue) && !R.has('id', nestedValue);

export type FiltersBadgesProps = LinkProps<any> & {
  translationsPath: string,
  className?: string,
};

export const FiltersBadges = linkInputs<any>(
  {
    initialData: {},
  },
)(
  ({className, translationsPath, l, value}: FiltersBadgesProps) => {
    const t = useI18n(translationsPath);
    const deleteButtonTitle = t('shared.titles.delete');

    const flattenFilters = useMemo<{key: string, translatorKey: string, value: any}[]>(
      () => R.toPairs(pickNonPaginationFilters(value)).flatMap(
        ([key, nestedValue]) => {
          if (R.isNil(nestedValue))
            return [];

          if (hasNestedObjectsValues(nestedValue)) {
            return (
              R
                .values(nestedValue)
                .map(
                  (item) => !R.isNil(item) && ({
                    key,
                    translatorKey: snakeCase(key),
                    value: item,
                  }),
                )
                .filter(Boolean)
            );
          }

          return {
            key,
            translatorKey: snakeCase(key),
            value: nestedValue,
          };
        },
      ),
      [value],
    );

    const onDeleteItem = (key: string, nestedValue: any) => {
      if (hasNestedObjectsValues(value)) {
        const nestedKey = findKeyByValue(nestedValue, value[key]);
        const newNestedValue = R.omit([nestedKey], value[key]);

        l.setValue(
          removeNullValues(
            {
              ...value,
              [key]: (
                R.isEmpty(newNestedValue)
                  ? null
                  : newNestedValue
              ),
            },
          ),
        );
      } else {
        l.setValue(
          R.omit([key], value),
        );
      }
    };

    return (
      <CleanList
        inline
        separated
        spaced={3}
        className={c(
          'c-filters-badges',
          className,
        )}
      >
        {flattenFilters.map(
          ({key, translatorKey, value: nestedValue}) => (
            <li
              key={`${key}-${JSON.stringify(nestedValue)}`}
              className='c-filters-badges__item'
            >
              <span className='c-filters-badges__item-title'>
                <strong>
                  {`${t(`${translatorKey}.single`)}:`}
                </strong>

                {nestedValue.name ?? nestedValue}
              </span>

              <TextButton
                className='c-filters-badges__item-delete'
                title={deleteButtonTitle}
                aria-label={deleteButtonTitle}
                onClick={
                  () => onDeleteItem(key, nestedValue)
                }
              >
                <TimesIcon />
              </TextButton>
            </li>
          ),
        )}
      </CleanList>
    );
  },
);
