import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

type CleanListProps = BasicWrapperProps & {
  inline?: boolean,
};

export const CleanList = ({inline, className, ...props}: CleanListProps) => (
  <ul
    className={c(
      'c-clean-list',
      inline && 'is-inline',
      className,
    )}
    {...props}
  />
);

CleanList.displayName = 'CleanList';
