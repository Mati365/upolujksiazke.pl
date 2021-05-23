import React, {ReactNode} from 'react';
import c from 'classnames';

import {UnderlinedTitle} from '@client/components/ui';

type LayoutHeaderTitleProps = {
  children: ReactNode,
  margin?: string,
};

export const LayoutHeaderTitle = (
  {
    children,
    margin,
  }: LayoutHeaderTitleProps,
) => (
  <UnderlinedTitle
    className={c(
      'c-layout-header-title',
      margin && `has-${margin}-margin`,
    )}
    tag='h1'
    withBottomBorder
  >
    {children}
  </UnderlinedTitle>
);

LayoutHeaderTitle.displayName = 'LayoutHeaderTitle';
