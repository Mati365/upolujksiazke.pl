import React from 'react';

import {useI18n} from '@client/i18n';

import {BookFullInfoReleaseRecord} from '@api/types';
import {Badge} from '@client/components/ui';
import {BookTypesIconsMap} from '../../cards/BookCard/BookTypesRow';
import {BookWebsitesAvailabilityTable} from './BookWebsitesAvailabilityTable';

type BookPricesReleaseRowProps = {
  release: BookFullInfoReleaseRecord,
};

export const BookPricesReleaseRow = ({release}: BookPricesReleaseRowProps) => {
  const t = useI18n('book.availability');
  const releaseTypeName = t(`shared.book.types.${release.type}`);
  const Icon = BookTypesIconsMap[release.type];

  return (
    <>
      <tr className='c-book-prices__release'>
        <td className='c-book-prices__release-type'>
          <Badge>
            <Icon title={releaseTypeName} />
            {releaseTypeName}
          </Badge>
        </td>

        <td className='c-book-prices__release-isbn has-double-link-chevron'>
          {release.isbn}
        </td>

        <td className='has-ellipsis'>
          <h3 className='c-book-prices__release-title'>
            {release.title}
          </h3>
        </td>
      </tr>

      {release.availability?.length > 0 && (
        <tr className='c-book-prices__availability has-no-outer-border'>
          <td colSpan={3}>
            <BookWebsitesAvailabilityTable availability={release.availability} />
          </td>
        </tr>
      )}
    </>
  );
};

BookPricesReleaseRow.displayName = 'BookPricesReleaseRow';
