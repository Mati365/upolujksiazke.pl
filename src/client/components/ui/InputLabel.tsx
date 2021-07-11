import React, {ReactNode} from 'react';
import c from 'classnames';

type InputLabelProps = {
  className?: string,
  spaced?: string,
  expanded?: boolean,
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
    spaced,
    expanded,
    children,
    label,
  }: InputLabelProps,
) => (
  <div
    className={c(
      'c-input-label',
      spaced && `is-spaced-${spaced}`,
      expanded && 'is-expanded',
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
