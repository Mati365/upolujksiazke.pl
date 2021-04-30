import React, {CSSProperties, ReactNode} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n/hooks/useI18n';

type QueryLoadingSpinnerProps = {
  style?: CSSProperties,
  className?: string,
  title?: ReactNode,
};

export const QueryLoadingSpinner = (
  {
    style, className, title,
  }: QueryLoadingSpinnerProps,
) => {
  const t = useI18n();

  return (
    <div
      className={c(
        'loading-layer',
        className,
      )}
      style={style}
    >
      <div className='loading-layer__progress' />
      <div className='loading-layer__title'>
        {title ?? t('shared.fetch_state.loading')}
      </div>
    </div>
  );
};

export const QueryErrorMessage = ({style}: QueryLoadingSpinnerProps) => {
  const t = useI18n();

  return (
    <div
      className='loading-layer text-muted'
      style={style}
    >
      {t('shared.fetch_state.errors')}
    </div>
  );
};
