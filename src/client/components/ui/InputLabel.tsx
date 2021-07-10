import React, {ReactNode} from 'react';
import c from 'classnames';

type InputLabelProps = {
  className?: string,
  labelClassName?: string,
  controlClassName?: string,
  label: ReactNode,
  children: ReactNode,
};

export const InputLabel = (
  {
    className,
    labelClassName,
    controlClassName,
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
    <span
      className={c(
        'c-input-label__label',
        labelClassName,
      )}
    >
      {label}
    </span>

    <span
      className={c(
        'c-input-label__control',
        controlClassName,
      )}
    >
      {children}
    </span>
  </div>
);

InputLabel.displayName = 'InputLabel';
