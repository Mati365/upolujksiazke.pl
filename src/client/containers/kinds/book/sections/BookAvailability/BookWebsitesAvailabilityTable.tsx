import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {buildURL} from '@shared/helpers/urlEncoder';

import {Table, TableProps} from '@client/components/ui';
import {TitledFavicon} from '@client/components/ui/TitledFavicon';

import {Price} from '@client/containers/Price';
import {BookCtaButton} from '@client/containers/kinds/book/controls/BookCtaButton';
import {TypedBookAvailabilityRecord} from '@client/containers/kinds/book/helpers';
import {BookReleaseTypeBadge} from './BooReleaseTypeBadge';

export {
  TypedBookAvailabilityRecord,
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
          <th>{t('store')}</th>
          {withType && (
            <th>{t('shared.book.type')}</th>
          )}
          <th>{t('prev_price')}</th>
          <th>{t('price')}</th>
          <th style={{width: 155}}>
            {t('shared.titles.action')}
          </th>
        </tr>
      </thead>
      <tbody>
        {availability.map((item) => {
          const {website, price, prevPrice, url} = item;
          const {smallThumb} = website.logo;

          const onOpen = () => {
            window.open(
              buildURL(
                url,
                {
                  utm_source: document.location.hostname,
                  utm_medium: 'site',
                  utm_campaign: 'compare table',
                },
              ),
              '_blank',
            );
          };

          return (
            <tr key={item.id}>
              <td>
                <TitledFavicon
                  className='is-undecorated-link has-hover-underline has-double-link-chevron'
                  src={smallThumb?.file}
                  title={website.title}
                  onClick={onOpen}
                >
                  {website.hostname}
                </TitledFavicon>
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
                  title={
                    t('buy')
                  }
                  size='small'
                  outlined
                  onClick={onOpen}
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
