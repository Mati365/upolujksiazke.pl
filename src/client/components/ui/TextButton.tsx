import React, {forwardRef} from 'react';
import c from 'classnames';

export type TextButtonProps = Omit<JSX.IntrinsicElements['button'], 'type'> & {
  type?: string,
  direction?: string,
};

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  (
    {
      className, type, direction,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type='button'
      {...props}
      className={c(
        'c-text-button',
        type && `is-text-${type}`,
        direction && `is-direction-${direction}`,
        className,
      )}
    />
  ),
);

TextButton.displayName = 'TextButton';
