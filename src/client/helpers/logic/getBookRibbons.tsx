import * as R from 'ramda';

import {BookCardRecord} from '@api/types/BookCard.record';
import {BookRibbonDescription} from '@client/containers/kinds/book/cards/BookCard/BookRibbons';
import {LangTranslateFn} from '@client/i18n/utils/createLangPack';

import {getDiscountPercentage} from './getDiscountPercentage';
import {normalizeFloatingNumber} from './normalizeFloatingNumber';

export function getBookRibbons(
  {
    t,
    book: {
      schoolBookId,
      totalRatings,
      highestPrice,
      lowestPrice,
    },
  }: {
    t: LangTranslateFn,
    book: BookCardRecord,
  },
): BookRibbonDescription[] {
  const ribbons: BookRibbonDescription[] = [];
  const discount = getDiscountPercentage(highestPrice, lowestPrice);

  if (totalRatings > 1000) {
    ribbons.push(
      {
        title: t('shared.ribbons.top'),
        color: 'red',
      },
    );
  }

  if (!R.isNil(schoolBookId)) {
    ribbons.push(
      {
        title: t('shared.ribbons.school'),
        color: 'blue',
      },
    );
  }

  if (discount) {
    ribbons.push(
      {
        title: `-${normalizeFloatingNumber(discount, 0)}%`,
        color: 'green',
      },
    );
  }

  return ribbons;
}
