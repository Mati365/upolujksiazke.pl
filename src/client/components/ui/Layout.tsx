import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

export const Layout = ({children, className}: BasicWrapperProps) => (
  <div className={c('c-layout', className)}>
    {children}
  </div>
);

Layout.displayName = 'Layout';
