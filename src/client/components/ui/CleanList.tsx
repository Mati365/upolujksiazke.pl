import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

type CleanListProps = BasicWrapperProps & {
  inline?: boolean,
  spaced?: number,
};

export const CleanList = ({inline, spaced, className, ...props}: CleanListProps) => (
  <ul
    className={c(
      'c-clean-list',
      inline && 'is-inline',
      spaced && `is-spaced-${spaced}`,
      className,
    )}
    {...props}
  />
);

CleanList.displayName = 'CleanList';
