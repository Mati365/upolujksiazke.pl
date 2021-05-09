import React, {ReactNode} from 'react';
import {UnderlinedTitle} from '@client/components/ui';

type LayoutHeaderTitleProps = {
  children: ReactNode,
};

export const LayoutHeaderTitle = ({children}: LayoutHeaderTitleProps) => (
  <UnderlinedTitle
    className='c-layout-header-title'
    tag='h1'
    withBottomBorder
  >
    {children}
  </UnderlinedTitle>
);

LayoutHeaderTitle.displayName = 'LayoutHeaderTitle';
