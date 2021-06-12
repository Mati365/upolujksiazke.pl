/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import c from 'classnames';

export const Favicon = ({className, ...props}: JSX.IntrinsicElements['img']) => (
  <span
    className={c(
      'c-favicon',
      className,
    )}
  >
    <img
      {...props}
      height={14}
    />
  </span>
);

Favicon.displayName = 'Favicon';
