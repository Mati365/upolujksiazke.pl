import React from 'react';

import {useI18n} from '@client/i18n';
import {MehIcon} from '@client/components/svg';

export const EmptyResults = () => {
  const t = useI18n();

  return (
    <div className='c-empty-results'>
      <MehIcon className='c-empty-results__icon' />

      <div className='c-empty-results__title'>
        {t('shared.titles.empty_results')}
      </div>
    </div>
  );
};

EmptyResults.displayName = 'EmptyResults';
