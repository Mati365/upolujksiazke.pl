import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {buildURL} from '@shared/helpers/urlEncoder';

import {ExpandableFooterContainer, Table, TableProps} from '@client/components/ui';
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
  shrink?: boolean,
  tableProps?: TableProps,
  availability: Array<TypedBookAvailabilityRecord>,
  truncatedAvailabilityCount?: number,
};

export const BookWebsitesAvailabilityTable = (
  {
    availability,
    tableProps,
    withType,
    shrink,
    truncatedAvailabilityCount = 3,
  }: BookWebsitesAvailabilityTableProps,
) => {
  const t = useI18n('book.availability');
  const renderContent = (expanded: boolean) => (
    <Table
      className='c-book-availability'
      layout='fixed'
      {...tableProps}
    >
      <thead>
        <tr>
          <th>{t('store')}</th>
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
        {R.take(
          expanded
            ? Infinity
            : truncatedAvailabilityCount,
          availability,
        ).map((item) => {
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
                  className={c(
                    shrink && 'is-text-tiny',
                    'is-cursor-pointer is-undecorated-link has-hover-underline',
                  )}
                  src={smallThumb?.file}
                  title={website.hostname}
                  onClick={onOpen}
                />
              </td>

              {!shrink && withType && (
                <td>
                  <BookReleaseTypeBadge type={item.bookType} />
                </td>
              )}

              {!shrink && (
                <td
                  className={c(
                    prevPrice && 'is-text-strike',
                  )}
                >
                  <Price value={prevPrice} />
                </td>
              )}

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
                    t(shrink ? 'shared.titles.open' : 'go_to_shop')
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
