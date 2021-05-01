import React from 'react';
import c from 'classnames';

type SpinnerProps = {
  className?: string,
};

export const Spinner = ({className}: SpinnerProps) => (
  <div
    className={c(
      'c-spinner',
      className,
    )}
  >
    <div />
    <div />
    <div />
    <div />
  </div>
);

Spinner.displayName = 'Spinner';
