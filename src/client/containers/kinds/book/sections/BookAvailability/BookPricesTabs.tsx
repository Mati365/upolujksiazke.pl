import React, {useMemo} from 'react';
import * as R from 'ramda';
import {$enum} from 'ts-enum-util';

import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';
import {
  sortAvailabilityByPrice,
  pickAllBookTypedReleases,
} from '@client/containers/kinds/book/helpers';

import {BookType} from '@shared/enums';
import {BookFullInfoRecord} from '@api/types';
import {Tabs} from '@client/components/ui';
import {SpreadsheetIcon} from '@client/components/svg';

import {MobileExpandableSelectButton} from '@client/containers/controls';
import {TypedBookAvailabilityRecord} from './BookWebsitesAvailabilityTable';
import {BookTypesIconsMap} from '../../cards/BookCard/BookTypesRow';
import {
  PlainAvailabilityList,
  ReleasePricesGroups,
} from './groups';

type BookPricesTabsProps = {
  book: BookFullInfoRecord,
  shrink?: boolean,
};

export const BookPricesTabs = ({book, shrink}: BookPricesTabsProps) => {
  const ua = useUA();
  const t = useI18n('book.availability');

  const {all, ...groups} = useMemo<Partial<Record<BookType | 'all', TypedBookAvailabilityRecord[]>>>(
    () => {
      const availability: TypedBookAvailabilityRecord[] = sortAvailabilityByPrice(
        pickAllBookTypedReleases(book),
      );

      return {
        all: availability,
        ...$enum(BookType).getValues().reduce(
          (acc, type) => {
            const items = availability.filter(({bookType}) => bookType === type);
            if (items.length)
              acc[type] = items;

            return acc;
          },
          {} as Record<BookType, TypedBookAvailabilityRecord[]>,
        ),
      };
    },
    [book.id],
  );

  const groupsPairs = R.toPairs(groups);

  return (
    <Tabs
      textOnly
      {...(
        ua.mobile
          ? {
            customNavRenderFn: ({items, activeTab, setActiveTab}) => (
              <MobileExpandableSelectButton
                items={items}
                value={activeTab}
                onChange={setActiveTab}
                title={
                  t('book.availability.choose_type')
                }
                renderSelectedValueFn={
                  (value) => (
                    <>
                      {`${t('book.availability.choose_type')}:`}
                      <span className='ml-1 is-text-semibold'>
                        {value.name}
                      </span>
                    </>
                  )
                }
              />
            ),
          }
          : {
            prependNav: (
              <li className='mr-2 is-text-muted is-text-small has-no-separator'>
                {t('shared.titles.group_by')}
              </li>
            ),
          }
      )}
    >
      {all.length > 0 && (
        <Tabs.Tab
          id={
            t('groups.all')
          }
          title={
            t('groups.all')
          }
        >
          {() => (
            <PlainAvailabilityList
              availability={all}
              shrink={shrink}
            />
          )}
        </Tabs.Tab>
      )}

      {groupsPairs.length > 1 && groupsPairs.map(
        ([type, items]) => {
          if (!items?.length)
            return null;

          const title = t(`groups.${type}`);
          return (
            <Tabs.Tab
              key={type}
              id={title}
              icon={BookTypesIconsMap[type]}
              title={title}
            >
              {() => (
                <PlainAvailabilityList
                  availability={items}
                  shrink={shrink}
                />
              )}
            </Tabs.Tab>
          );
        },
      )}

      <Tabs.Tab
        id={
          t('groups.by_release')
        }
        icon={SpreadsheetIcon}
        title={
          t('groups.by_release')
        }
      >
        {() => <ReleasePricesGroups book={book} />}
      </Tabs.Tab>
    </Tabs>
  );
};

BookPricesTabs.displayName = 'BookPricesTabs';
