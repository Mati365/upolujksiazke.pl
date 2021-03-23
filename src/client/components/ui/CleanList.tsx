import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

export type CleanListProps = BasicWrapperProps & {
  inline?: boolean,
  block?: boolean,
  wrap?: boolean,
  spaced?: number,
  align?: string,
};

export const CleanList = (
  {
    block = true,
    inline = true,
    wrap,
    spaced,
    align,
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
      align && `is-aligned-${align}`,
      className,
    )}
    {...props}
  />
);

CleanList.displayName = 'CleanList';
