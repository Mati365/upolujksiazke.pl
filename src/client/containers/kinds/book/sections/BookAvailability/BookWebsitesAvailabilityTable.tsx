import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {Table, Favicon} from '@client/components/ui';
import {Price} from '@client/containers/Price';
import {BookAvailabilityRecord} from '@api/types';
import {BookCtaButton} from '@client/containers/controls/BookCtaButton';

type BookWebsitesAvailabilityTableProps = {
  availability: BookAvailabilityRecord[],
};

export const BookWebsitesAvailabilityTable = ({availability}: BookWebsitesAvailabilityTableProps) => {
  const t = useI18n('book.availability');

  return (
    <Table
      className='c-book-release-prices'
      nested
    >
      <thead>
        <tr>
          <th>{t('website')}</th>
          <th>{t('prev_price')}</th>
          <th>{t('price')}</th>
          <th>{t('action')}</th>
        </tr>
      </thead>
      <tbody>
        {availability.map((item) => {
          const {website, price, prevPrice} = item;
          const {smallThumb} = website.logo;

          return (
            <tr key={item.id}>
              <td>
                <span className='c-flex-row is-text-semibold'>
                  {smallThumb?.file && (
                    <Favicon
                      className='mr-2'
                      src={smallThumb.file}
                      alt='Logo'
                      title={website.title}
                    />
                  )}
                  {website.hostname}
                </span>
              </td>

              <td
                className={c(
                  prevPrice && 'is-text-strike',
                )}
              >
                <Price value={prevPrice} />
              </td>

              <td>
                <Price
                  className={c(
                    !R.isNil(price) && 'is-text-bold is-text-primary',
                  )}
                  value={price}
                />
              </td>

              <td>
                <BookCtaButton
                  title={t('buy')}
                  size='small'
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

BookWebsitesAvailabilityTable.displayName = 'BookWebsitesAvailabilityTable';
