import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {Table, TableProps, Favicon, UndecoratedLink} from '@client/components/ui';
import {Price} from '@client/containers/Price';
import {BookType} from '@shared/enums';
import {BookAvailabilityRecord} from '@api/types';
import {BookCtaButton} from '@client/containers/controls/BookCtaButton';
import {BookReleaseTypeBadge} from './BooReleaseTypeBadge';

export type TypedBookAvailabilityRecord = BookAvailabilityRecord & {
  bookType?: BookType,
};

type BookWebsitesAvailabilityTableProps = {
  withType?: boolean,
  tableProps?: TableProps,
  availability: Array<TypedBookAvailabilityRecord>,
};

export const BookWebsitesAvailabilityTable = (
  {
    availability,
    tableProps,
    withType,
  }: BookWebsitesAvailabilityTableProps,
) => {
  const t = useI18n('book.availability');

  return (
    <Table
      className='c-book-availability'
      layout='fixed'
      {...tableProps}
    >
      <thead>
        <tr>
          <th>{t('website')}</th>
          {withType && (
            <th>{t('type')}</th>
          )}
          <th>{t('prev_price')}</th>
          <th>{t('price')}</th>
          <th style={{width: 155}}>{t('action')}</th>
        </tr>
      </thead>
      <tbody>
        {availability.map((item) => {
          const {website, price, prevPrice, url} = item;
          const {smallThumb} = website.logo;

          return (
            <tr key={item.id}>
              <td>
                <UndecoratedLink
                  className='c-flex-row is-text-semibold is-text-primary is-undecorated-link has-double-link-chevron'
                  href={url}
                  rel='noopener noreferrer nofollow'
                >
                  {smallThumb?.file && (
                    <Favicon
                      className='mr-2'
                      src={smallThumb.file}
                      alt='Logo'
                      title={website.title}
                    />
                  )}
                  {website.hostname}
                </UndecoratedLink>
              </td>

              {withType && (
                <td>
                  <BookReleaseTypeBadge type={item.bookType} />
                </td>
              )}

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
                  outlined
                  onClick={
                    () => {
                      window.open(url, '_blank');
                    }
                  }
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
