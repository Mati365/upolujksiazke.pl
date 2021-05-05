import React, {ReactNode} from 'react';
import c from 'classnames';

type InputLabelProps = {
  className?: string,
  label: ReactNode,
  children: ReactNode,
};

export const InputLabel = (
  {
    className,
    children,
    label,
  }: InputLabelProps,
) => (
  <div
    className={c(
      'c-input-label',
      className,
    )}
  >
    <span className='c-input-label__label'>
      {label}
    </span>

    <span className='c-input-label__control'>
      {children}
    </span>
  </div>
);

InputLabel.displayName = 'InputLabel';
