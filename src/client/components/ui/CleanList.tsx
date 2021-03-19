import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

export type CleanListProps = BasicWrapperProps & {
  inline?: boolean,
  block?: boolean,
  wrap?: boolean,
  spaced?: number,
};

export const CleanList = (
  {
    block = true,
    wrap,
    inline,
    spaced,
    className,
    ...props
  }: CleanListProps,
) => (
  <ul
    className={c(
      'c-clean-list',
      block && 'is-block',
      inline && 'is-inline',
      wrap && 'is-wrapped',
      spaced && `is-spaced-${spaced}`,
      className,
    )}
    {...props}
  />
);

CleanList.displayName = 'CleanList';
