import React from 'react';
import c from 'classnames';

import {useUA} from '@client/modules/ua';

import {ExpandableFooterContainer, CleanList} from '@client/components/ui';
import {TagRecord} from '@api/types';
import {TagLink} from '@client/routes/Links';

type TagsListProps = {
  items: TagRecord[],
  className?: string,
};

export const TagsList = ({items, className}: TagsListProps) => {
  const ua = useUA();
  const maxCount = (
    ua.mobile
      ? 6
      : 30
  );

  return (
    <ExpandableFooterContainer
      translationPath='shared.buttons.expand_tags'
      footerClassName='is-text-small pt-2'
      showFooter={
        items.length > maxCount
      }
    >
      {(expanded) => (
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
            (item, index) => (
              <li
                key={item.id}
                className={c(
                  {
                    'is-hidden': !expanded && index > maxCount,
                  },
                )}
              >
                <TagLink item={item}>
                  {`#${item.name}`}
                </TagLink>
              </li>
            ),
          )}
        </CleanList>
      )}
    </ExpandableFooterContainer>
  );
};

TagsList.displayName = 'TagsList';
