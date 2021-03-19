import React, {forwardRef} from 'react';
import c from 'classnames';

type TextButtonProps = Omit<JSX.IntrinsicElements['button'], 'type'> & {
  type?: string,
};

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  ({className, type, ...props}, ref) => (
    <button
      ref={ref}
      type='button'
      {...props}
      className={c(
        'c-text-button',
        type && `is-text-${type}`,
        className,
      )}
    />
  ),
);

TextButton.displayName = 'TextButton';
