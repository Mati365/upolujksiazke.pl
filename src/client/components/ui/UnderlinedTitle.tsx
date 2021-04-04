import React from 'react';
import c from 'classnames';

export type UnderlinedTitleProps = JSX.IntrinsicElements['span'] & {
  tag?: any,
};

export const UnderlinedTitle = (
  {
    tag: Tag = 'span',
    className,
    ...props
  }: UnderlinedTitleProps,
) => (
  <Tag
    className={c(
      'c-underlined-title',
      className,
    )}
    {...props}
  />
);

UnderlinedTitle.displayName = 'UnderlinedTitle';
