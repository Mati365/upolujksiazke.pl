import React, {ReactNode} from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

type SectionProps = BasicWrapperProps & {
  title?: ReactNode,
  bordered?: boolean,
};

export const Section = (
  {
    title,
    bordered = true,
    className, children,
  }: SectionProps,
) => (
  <section
    className={c(
      'c-section',
      bordered && 'is-divided',
      className,
    )}
  >
    {title && (
      <h2 className='c-section__header'>
        {title}
      </h2>
    )}

    <div className='c-section__content'>
      {children}
    </div>
  </section>
);

Section.displayName = 'Section';
