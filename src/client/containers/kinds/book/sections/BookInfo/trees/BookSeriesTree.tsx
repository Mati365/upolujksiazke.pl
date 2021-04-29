import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {Tree} from '@client/components/ui';
import {SeriesBookRecord} from '@api/types';
import {BookLink} from '@client/routes/Links';

type BookSeriesTreeProps = {
  activeBookId?: number,
  className?: string,
  size?: string,
  items: SeriesBookRecord[],
};

export const BookSeriesTree = (
  {
    activeBookId,
    className,
    size,
    items,
  }: BookSeriesTreeProps,
) => {
  const t = useI18n();
  if (!items?.length)
    return null;

  // some books like harry potter have not
  // volume prefix, just different names
  // do not display volumes if all of them is volume 1
  const noVolumeNames = R.uniq(R.map(
    ({volume}) => volume?.id,
    items,
  )).length <= 1;

  return (
    <Tree
      size={size}
      className={c(
        'c-book-series-tree',
        className,
      )}
    >
      {items.map(
        (item, index) => (
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
              {`${noVolumeNames ? `#${index + 1} ` : ''}${formatBookTitle(
                {
                  t,
                  book: item,
                  withDefaultVolumeName: false,
                  volumeFirst: true,
                },
              )}`}
            </BookLink>
          </li>
        ),
      )}
    </Tree>
  );
};

BookSeriesTree.displayName = 'BookSeriesTree';
