import React from 'react';
import c from 'classnames';

import {TagRecord} from '@api/types';
import {TagLink} from '@client/routes/Links';
import {CleanList} from '@client/components/ui';

type TagsListProps = {
  items: TagRecord[],
  className?: string,
};

export const TagsList = ({items, className}: TagsListProps) => (
  <CleanList
    block
    inline
    wrap
    className={c(
      'c-tags-list',
      className,
    )}
  >
    {items.map(
      (item) => (
        <li key={item.id}>
          <TagLink item={item}>
            {`#${item.name}`}
          </TagLink>
        </li>
      ),
    )}
  </CleanList>
);

TagsList.displayName = 'TagsList';
