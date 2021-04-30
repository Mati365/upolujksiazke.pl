import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

export type CleanListProps = BasicWrapperProps & {
  tag?: any,
  inline?: boolean,
  block?: boolean,
  lastSpaced?: boolean,
  wrap?: boolean,
  spaced?: number,
  align?: string,
  justify?: string,
  separated?: boolean,
};

export const CleanList = (
  {
    tag: Tag = 'ul',
    block = true,
    inline = true,
    lastSpaced,
    separated,
    wrap,
    spaced,
    align,
    justify,
    className,
    ...props
  }: CleanListProps,
) => (
  <Tag
    className={c(
      'c-clean-list',
      block && 'is-block',
      inline && 'is-inline',
      wrap && 'is-wrapped',
      spaced && `is-spaced-${spaced}`,
      align && `is-aligned-${align}`,
      justify && `is-justified-${justify}`,
      separated && 'is-separated',
      lastSpaced && 'is-last-spaced',
      className,
    )}
    {...props}
  />
);

CleanList.displayName = 'CleanList';
