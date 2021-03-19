import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

export type DescriptionBoxProps = BasicWrapperProps & {
  justify?: boolean,
};

export const DescriptionBox = (
  {
    children,
    className,
    justify = true,
  }: DescriptionBoxProps,
) => (
  <div
    className={c(
      'c-description-box',
      justify && 'is-text-justify',
      className,
    )}
  >
    {children}
  </div>
);

DescriptionBox.displayName = 'DescriptionBox';
