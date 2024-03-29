import React from 'react';

import {BookFullInfoReleaseRecord} from '@api/types';
import {BookWebsitesAvailabilityTable} from '../../BookWebsitesAvailabilityTable';
import {BookReleaseTypeBadge} from '../../BooReleaseTypeBadge';

type BookPricesReleaseRowProps = {
  release: BookFullInfoReleaseRecord,
};

export const BookPricesReleaseRow = ({release}: BookPricesReleaseRowProps) => (
  <>
    <tr className='c-book-prices__release'>
      <td className='c-book-prices__release-type'>
        <BookReleaseTypeBadge type={release.type} />
      </td>

      <td className='c-book-prices__release-isbn'>
        {release.isbn}
      </td>

      <td className='has-ellipsis'>
        <span className='c-book-prices__release-title'>
          {release.title}
        </span>
      </td>
    </tr>

    {release.availability?.length > 0 && (
      <tr className='c-book-prices__availability has-no-outer-border'>
        <td colSpan={3}>
          <BookWebsitesAvailabilityTable
            availability={release.availability}
            tableProps={{
              nested: true,
              layout: 'fixed',
            }}
          />
        </td>
      </tr>
    )}
  </>
);

BookPricesReleaseRow.displayName = 'BookPricesReleaseRow';
