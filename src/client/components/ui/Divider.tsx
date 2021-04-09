import React from 'react';
import c from 'classnames';

type BasicDividerProps = {
  className?: string,
  noBorder?: boolean,
  spaced?: number,
};

export const Divider = (
  {
    spaced = 2,
    noBorder,
    className,
  }: BasicDividerProps,
) => (
  <hr
    className={c(
      'c-divider',
      spaced && `is-spaced-${spaced}`,
      noBorder && 'has-no-border',
      className,
    )}
  />
);

Divider.displayName = 'Divider';
