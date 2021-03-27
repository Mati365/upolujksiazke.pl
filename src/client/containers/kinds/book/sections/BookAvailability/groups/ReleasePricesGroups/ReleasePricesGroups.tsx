import React, {useMemo} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {sortReleasesByPrice} from '@client/containers/kinds/book/helpers';

import {BookFullInfoRecord} from '@api/types';
import {Table} from '@client/components/ui';
import {BookPricesReleaseRow} from './BookPricesReleaseRow';

type BookPricesListProps = {
  book: BookFullInfoRecord,
  className?: string,
};

export const ReleasePricesGroups = ({className, book}: BookPricesListProps) => {
  const t = useI18n('shared.book');
  const sortedReleases = useMemo(
    () => sortReleasesByPrice(book.releases),
    [book.id],
  );

  return (
    <Table
      className={c(
        'c-book-prices',
        className,
      )}
      layout='fixed'
    >
      <thead>
        <tr>
          <th style={{width: 110}}>{t('type')}</th>
          <th style={{width: 160}}>{t('isbn')}</th>
          <th>{t('release')}</th>
        </tr>
      </thead>
      <tbody>
        {sortedReleases.map(
          (release) => (
            <BookPricesReleaseRow
              key={release.id}
              release={release}
            />
          ),
        )}
      </tbody>
    </Table>
  );
};

ReleasePricesGroups.displayName = 'ReleasePricesGroups';
