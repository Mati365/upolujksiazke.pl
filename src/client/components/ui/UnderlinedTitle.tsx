import React from 'react';
import c from 'classnames';

export type UnderlinedTitleProps = JSX.IntrinsicElements['span'] & {
  tag?: any,
  withBottomBorder?: boolean,
};

export const UnderlinedTitle = (
  {
    tag: Tag = 'span',
    className,
    withBottomBorder,
    ...props
  }: UnderlinedTitleProps,
) => (
  <Tag
    className={c(
      'c-underlined-title',
      withBottomBorder && 'has-bottom-border',
      className,
    )}
    {...props}
  />
);

UnderlinedTitle.displayName = 'UnderlinedTitle';
