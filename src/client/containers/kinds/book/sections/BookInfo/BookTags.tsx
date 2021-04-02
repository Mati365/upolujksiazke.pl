import React from 'react';

import {useI18n} from '@client/i18n';

import {TagsList} from '@client/containers/controls/TagsList';
import {AnchorIcon} from '@client/components/svg';
import {TagRecord} from '@api/types';

type BookTagsProps = {
  tags: TagRecord[],
};

export const BookTags = ({tags}: BookTagsProps) => {
  const t = useI18n();

  return (
    <div className='c-book-info-section__tags'>
      <div className='c-book-info-section__tags-title is-text-muted is-text-small'>
        <AnchorIcon className='mr-2' />
        {`${t('shared.titles.keywords')}:`}
      </div>

      <TagsList items={tags} />
    </div>
  );
};

BookTags.displayName = 'BookTags';
