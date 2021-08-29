import React, {forwardRef} from 'react';
import c from 'classnames';

export type TextButtonProps = Omit<JSX.IntrinsicElements['button'], 'type'> & {
  type?: string,
  size?: string,
  direction?: string,
};

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  (
    {
      className, size,
      type, direction,
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
        size && `is-text-${size}`,
        direction && `is-direction-${direction}`,
        className,
      )}
    />
  ),
);

TextButton.displayName = 'TextButton';
