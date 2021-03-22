import React from 'react';
import c from 'classnames';

type BasicDividerProps = {
  className?: string,
  spaced?: number,
};

export const Divider = (
  {
    spaced = 2,
    className,
  }: BasicDividerProps,
) => (
  <hr
    className={c(
      'c-divider',
      spaced && `is-spaced-${spaced}`,
      className,
    )}
  />
);

Divider.displayName = 'Divider';
