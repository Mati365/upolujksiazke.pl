import React from 'react';
import c from 'classnames';

export type InputProps = JSX.IntrinsicElements['input'];

export const Input = ({className, ...props}: InputProps) => (
  <input
    className={c(
      'c-input',
      className,
    )}
    {...props}
  />
);
