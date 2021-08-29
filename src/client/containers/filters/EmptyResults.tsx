import React from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {MehIcon} from '@client/components/svg';

type EmptyResultsProps = {
  spacing?: string,
};

export const EmptyResults = ({spacing}: EmptyResultsProps) => {
  const t = useI18n();

  return (
    <div
      className={c(
        'c-empty-results',
        spacing && `is-${spacing}-spacing`,
      )}
    >
      <MehIcon className='c-empty-results__icon' />

      <div className='c-empty-results__title'>
        {t('shared.titles.empty_results')}
      </div>
    </div>
  );
};

EmptyResults.displayName = 'EmptyResults';
