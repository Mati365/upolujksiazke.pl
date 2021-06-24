import React, {MouseEventHandler, ReactNode} from 'react';
import c from 'classnames';

export type InputProps = JSX.IntrinsicElements['input'] & {
  iconLeft?: ReactNode,
  iconRight?: ReactNode,
  iconStyle?: string,
  iconTitle?: string,
  onIconClick?: MouseEventHandler,
};

export const Input = (
  {
    className,
    iconTitle,
    iconLeft,
    iconRight,
    iconStyle,
    onClick,
    onIconClick,
    ...props
  }: InputProps,
) => {
  const IconHolder = (
    onIconClick
      ? 'button'
      : 'span'
  );

  return (
    <span
      className={c(
        'c-input',
        iconStyle && `has-${iconStyle}-icon`,
        iconLeft && 'has-icon-left',
        iconRight && 'has-icon-right',
        className,
      )}
      onClick={onClick}
    >
      {iconLeft && (
        <IconHolder
          className='c-input__icon is-left'
          aria-label={iconTitle}
          onClick={onIconClick}
        >
          {iconLeft}
        </IconHolder>
      )}
      <input {...props} />
      {iconRight && (
        <IconHolder
          className='c-input__icon is-right'
          aria-label={iconTitle}
          onClick={onIconClick}
        >
          {iconRight}
        </IconHolder>
      )}
    </span>
  );
};
