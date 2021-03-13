import React from 'react';
import {BasicWrapperProps} from '@client/components/ui';

export const Layout = ({children}: BasicWrapperProps) => (
  <div className='c-layout'>
    {children}
  </div>
);

Layout.displayName = 'Layout';
