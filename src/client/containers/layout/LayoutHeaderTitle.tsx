import React, {ReactNode} from 'react';
import c from 'classnames';

import {UnderlinedTitle} from '@client/components/ui';

type LayoutHeaderTitleProps = {
  children: ReactNode,
  margin?: string,
  toolbar?: ReactNode,
};

export const LayoutHeaderTitle = (
  {
    toolbar,
    children,
    margin,
  }: LayoutHeaderTitleProps,
) => (
  <UnderlinedTitle
    className={c(
      'c-layout-header-title',
      margin && `has-${margin}-margin`,
    )}
    tag='div'
    withBottomBorder
  >
    <h1>
      {children}
    </h1>

    {toolbar && (
      <span className='c-layout-header-title__toolbar'>
        {toolbar}
      </span>
    )}
  </UnderlinedTitle>
);

LayoutHeaderTitle.displayName = 'LayoutHeaderTitle';
