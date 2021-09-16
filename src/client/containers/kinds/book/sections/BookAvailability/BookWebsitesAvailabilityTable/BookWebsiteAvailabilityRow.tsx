import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {buildURL} from '@shared/helpers/urlEncoder';

import {TypedBookAvailabilityRecord} from '@client/containers/kinds/book/helpers';
import {TitledFavicon} from '@client/components/ui/TitledFavicon';
import {Price} from '@client/containers/Price';
import {BookCtaButton} from '@client/containers/kinds/book/controls/BookCtaButton';
import {BookReleaseTypeBadge} from '../BooReleaseTypeBadge';

type BookWebsiteAvailabilityRowProps = {
  item: TypedBookAvailabilityRecord,
  shrink?: boolean,
  withType?: boolean,
  onlyWebsiteLogo?: boolean,
};

export const BookWebsiteAvailabilityRow = (
  {
    item,
    shrink,
    withType,
    onlyWebsiteLogo,
  }: BookWebsiteAvailabilityRowProps,
) => {
  const t = useI18n('book.availability');

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
    <tr>
      <td>
        <TitledFavicon
          className={c(
            shrink && 'is-text-tiny',
            'is-cursor-pointer is-undecorated-link has-hover-underline',
          )}
          src={smallThumb?.file}
          centered={onlyWebsiteLogo}
          onClick={onOpen}
          {...!onlyWebsiteLogo && {
            title: website.hostname,
          }}
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
};
