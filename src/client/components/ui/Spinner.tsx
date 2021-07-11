import React from 'react';
import c from 'classnames';

type SpinnerProps = {
  className?: string,
  size?: string,
};

export const Spinner = ({className, size}: SpinnerProps) => (
  <div
    className={c(
      'c-spinner',
      size && `is-${size}-sized`,
      className,
    )}
  />
);

Spinner.displayName = 'Spinner';
