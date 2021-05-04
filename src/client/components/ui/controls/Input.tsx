import React, {ReactNode} from 'react';
import c from 'classnames';

export type InputProps = JSX.IntrinsicElements['input'] & {
  iconLeft?: ReactNode,
  iconRight?: ReactNode,
};

export const Input = (
  {
    className,
    iconLeft,
    iconRight,
    ...props
  }: InputProps,
) => (
  <span
    className={c(
      'c-input',
      iconLeft && 'has-icon-left',
      iconRight && 'has-icon-right',
      className,
    )}
  >
    {iconLeft && (
      <span className='c-input__icon is-left'>
        {iconLeft}
      </span>
    )}
    <input {...props} />
    {iconRight && (
      <span className='c-input__icon is-right'>
        {iconRight}
      </span>
    )}
  </span>
);
