import React from 'react';

import {useI18n} from '@client/i18n';
import {TextButton} from '../TextButton';

export type AsyncExpandableToolbarProps = {
  remain: number,
  loaded: number,
  onExpand: VoidFunction,
};

export const DefaultAsyncExpandableToolbar = ({remain, onExpand}) => {
  const t = useI18n();
  if (!remain)
    return null;

  return (
    <div className='mt-3 c-flex-center'>
      <TextButton
        type='primary'
        className='is-text-tiny is-text-semibold'
        onClick={() => onExpand()}
      >
        {`${t('shared.titles.more')} (${remain})`}
      </TextButton>
    </div>
  );
};

DefaultAsyncExpandableToolbar.displayName = 'DefaultAsyncExpandableToolbar';
