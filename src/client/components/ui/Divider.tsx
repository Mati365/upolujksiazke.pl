import React from 'react';
import c from 'classnames';

type BasicDividerProps = {
  className?: string,
  noBorder?: boolean,
  spaced?: number,
  fill?: string,
};

export const Divider = (
  {
    spaced = 2,
    noBorder,
    fill,
    className,
  }: BasicDividerProps,
) => (
  <hr
    className={c(
      'c-divider',
      spaced && `is-spaced-${spaced}`,
      fill && `has-${fill}-fill`,
      noBorder && 'has-no-border',
      className,
    )}
  />
);

Divider.displayName = 'Divider';
