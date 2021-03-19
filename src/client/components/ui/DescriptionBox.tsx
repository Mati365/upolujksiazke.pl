import React from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

type DescriptionBoxProps = BasicWrapperProps & Pick<JSX.IntrinsicElements['div'], 'dangerouslySetInnerHTML'> & {
  justify?: boolean,
};

export const DescriptionBox = (
  {
    children,
    className,
    dangerouslySetInnerHTML,
    justify = true,
  }: DescriptionBoxProps,
) => (
  <div
    dangerouslySetInnerHTML={dangerouslySetInnerHTML}
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
