import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {ExpandableFooterContainer, Table, TableProps} from '@client/components/ui';
import {TypedBookAvailabilityRecord} from '@client/containers/kinds/book/helpers';
import {BookWebsiteAvailabilityRow} from './BookWebsiteAvailabilityRow';

export {
  TypedBookAvailabilityRecord,
};

type BookWebsitesAvailabilityTableProps = {
  className?: string,
  withType?: boolean,
  shrink?: boolean,
  onlyWebsiteLogo?: boolean,
  tableProps?: TableProps,
  availability: Array<TypedBookAvailabilityRecord>,
  truncatedAvailabilityCount?: number,
};

export const BookWebsitesAvailabilityTable = (
  {
    className,
    availability,
    tableProps,
    withType,
    shrink,
    onlyWebsiteLogo,
    truncatedAvailabilityCount = 3,
  }: BookWebsitesAvailabilityTableProps,
) => {
  const t = useI18n('book.availability');
  const renderContent = (expanded: boolean) => (
    <Table
      className={c(
        'c-book-availability',
        className,
      )}
      layout='fixed'
      {...tableProps}
    >
      <thead>
        <tr>
          <th
            {...onlyWebsiteLogo && {
              style: {
                width: 84,
              },
            }}
          >
            {t('store')}
          </th>

          {!shrink && withType && (
            <th>{t('shared.book.type')}</th>
          )}

          {!shrink && (
            <th>{t('prev_price')}</th>
          )}

          <th>{t('price')}</th>

          <th
            {...!shrink && {
              style: {
                width: 155,
              },
            }}
          >
            {t('shared.titles.action')}
          </th>
        </tr>
      </thead>
      <tbody>
        {(
          R
            .take(
              expanded
                ? Infinity
                : truncatedAvailabilityCount,
              availability,
            )
            .map((item) => (
              <BookWebsiteAvailabilityRow
                key={item.id}
                item={item}
                shrink={shrink}
                withType={withType}
                onlyWebsiteLogo={onlyWebsiteLogo}
              />
            ))
        )}
      </tbody>
    </Table>
  );

  return (
    <ExpandableFooterContainer
      showFooter={
        availability.length > truncatedAvailabilityCount
      }
    >
      {renderContent}
    </ExpandableFooterContainer>
  );
};

BookWebsitesAvailabilityTable.displayName = 'BookWebsitesAvailabilityTable';
