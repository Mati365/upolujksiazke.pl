import React from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

import {
  BookFullInfoRecord,
  BookFullInfoReleaseRecord,
} from '@api/types';

import {Badge, Table} from '@client/components/ui';
import {BookTypesIconsMap} from '../../cards/BookCard/BookTypesRow';

type BookPricesListProps = {
  book: BookFullInfoRecord,
  className?: string,
};

const BookPricesReleaseRow = ({release}: {release: BookFullInfoReleaseRecord}) => {
  const t = useI18n('book.availability');
  const releaseTypeName = t(`shared.book.types.${release.type}`);
  const Icon = BookTypesIconsMap[release.type];

  return (
    <tr className='c-book-prices__release'>
      <td className='c-book-prices__release-type'>
        <Badge>
          <Icon title={releaseTypeName} />
          {releaseTypeName}
        </Badge>
      </td>

      <td className='c-book-prices__release-isbn'>
        {release.isbn}
      </td>

      <td className='has-ellipsis'>
        <h3 className='c-book-prices__release-title'>
          {release.title}
        </h3>
      </td>
    </tr>
  );
};

export const BookPricesList = ({className, book}: BookPricesListProps) => {
  const {releases} = book;
  const t = useI18n('book.availability');

  return (
    <Table
      className={c(
        'c-book-prices',
        className,
      )}
    >
      <thead>
        <tr>
          <th>{t('type')}</th>
          <th>{t('isbn')}</th>
          <th style={{width: '65%'}}>{t('release')}</th>
        </tr>
      </thead>
      <tbody>
        {releases.map(
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

BookPricesList.displayName = 'BookPricesList';
