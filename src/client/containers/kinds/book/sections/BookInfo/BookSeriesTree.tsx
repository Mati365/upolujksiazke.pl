import React, {ReactNode} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {TitledTree} from '@client/components/ui';
import {SeriesBookRecord} from '@api/types';
import {BookLink} from '@client/routes/Links';

type BookSeriesTreeProps = {
  activeBookId?: number,
  className?: string,
  title?: ReactNode,
  items: SeriesBookRecord[],
};

export const BookSeriesTree = (
  {
    activeBookId,
    className,
    title,
    items,
  }: BookSeriesTreeProps,
) => {
  const t = useI18n();
  if (!items?.length)
    return null;

  return (
    <TitledTree
      title={title}
      className={c(
        'c-book-series-tree',
        className,
      )}
    >
      {items.map(
        (item) => (
          <li
            key={item.id}
            className={c(
              activeBookId === item.id && 'is-active',
            )}
          >
            <BookLink
              item={item}
              className='is-undecorated-link has-hover-underline has-double-link-chevron'
            >
              {formatBookTitle(
                {
                  t,
                  book: item,
                  withDefaultVolumeName: true,
                  volumeFirst: true,
                },
              )}
            </BookLink>
          </li>
        ),
      )}
    </TitledTree>
  );
};

BookSeriesTree.displayName = 'BookSeriesTree';
