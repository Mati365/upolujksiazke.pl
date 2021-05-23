import React from 'react';

import {useI18n} from '@client/i18n';
import {TextButton} from '../TextButton';

export type AsyncExpandableToolbarProps = {
  remain: number,
  loaded: number,
  tag?: any,
  onExpand: VoidFunction,
};

export const DefaultAsyncExpandableToolbar = (
  {
    remain,
    onExpand,
    tag: Tag = 'div',
  }: AsyncExpandableToolbarProps,
) => {
  const t = useI18n();
  if (!remain)
    return null;

  return (
    <Tag className='mt-2 c-flex-center'>
      <TextButton
        type='primary'
        className='is-text-tiny is-text-semibold'
        onClick={() => onExpand()}
      >
        {`${t('shared.titles.more')} (${remain})`}
      </TextButton>
    </Tag>
  );
};

DefaultAsyncExpandableToolbar.displayName = 'DefaultAsyncExpandableToolbar';
