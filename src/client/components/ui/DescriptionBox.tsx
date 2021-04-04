import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

export type DescriptionBoxProps = BasicWrapperProps & {
  justify?: boolean,
  padding?: string,
};

export const DescriptionBox = (
  {
    children,
    className,
    padding,
    justify = true,
  }: DescriptionBoxProps,
) => (
  <div
    className={c(
      'c-description-box',
      justify && 'is-text-justify',
      padding && `has-${padding}-padding`,
      className,
    )}
  >
    {children}
  </div>
);

DescriptionBox.displayName = 'DescriptionBox';
