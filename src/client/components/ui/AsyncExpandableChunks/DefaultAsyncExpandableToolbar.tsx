import React from 'react';

import {useI18n} from '@client/i18n';
import {Button} from '../Button';

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
      <Button
        size='small'
        onClick={() => onExpand()}
      >
        {`${t('shared.titles.more')} (${remain})`}
      </Button>
    </div>
  );
};

DefaultAsyncExpandableToolbar.displayName = 'DefaultAsyncExpandableToolbar';
