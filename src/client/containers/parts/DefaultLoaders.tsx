import React, {CSSProperties, ReactNode} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n/hooks/useI18n';
import {Spinner} from '@client/components/ui';

type QueryLoadingSpinnerProps = {
  style?: CSSProperties,
  className?: string,
  title?: ReactNode,
  layer?: boolean,
};

export const QueryLoadingSpinner = (
  {
    style, className,
    layer, title,
  }: QueryLoadingSpinnerProps,
) => {
  const t = useI18n();

  return (
    <div
      className={c(
        'c-loading-layer',
        layer && 'is-layer',
        className,
      )}
      style={style}
    >
      <div className='c-loading-layer__content'>
        <Spinner className='c-loading-layer__progress' />
        <div className='c-loading-layer__title'>
          {title ?? t('shared.fetch_state.loading')}
        </div>
      </div>
    </div>
  );
};

export const QueryErrorMessage = ({style}: QueryLoadingSpinnerProps) => {
  const t = useI18n();

  return (
    <div
      className='c-loading-layer text-muted'
      style={style}
    >
      {t('shared.fetch_state.errors')}
    </div>
  );
};
