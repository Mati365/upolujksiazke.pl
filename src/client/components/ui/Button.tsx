import React from 'react';
import c from 'classnames';
import {BasicWrapperProps} from './Container';

export type ButtonProps = BasicWrapperProps & {
  type?: string,
  size?: string,
  outlined?: boolean,
  expanded?: boolean,
  iconSuffix?: boolean,
  disabled?: boolean,
  htmlType?: JSX.IntrinsicElements['button']['type'],
};

export const Button = (
  {
    className,
    type,
    size,
    outlined,
    expanded,
    iconSuffix,
    htmlType = 'button',
    ...props
  }: ButtonProps,
) => (
  <button
    // eslint-disable-next-line react/button-has-type
    type={htmlType}
    className={c(
      'c-button',
      type && `is-${type}`,
      size && `is-${size}`,
      outlined && 'is-outlined',
      iconSuffix && 'has-icon-suffix',
      expanded && 'is-expanded',
      className,
    )}
    {...props}
  />
);

Button.displayName = 'Button';
