import React, {ReactNode} from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

type SectionProps = BasicWrapperProps & {
  title?: ReactNode,
  bordered?: boolean,
  headerClassName?: string,
};

export const Section = (
  {
    title,
    bordered = true,
    className, headerClassName,
    children,
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
      <h2
        className={c(
          'c-section__header',
          headerClassName,
        )}
      >
        {title}
        <span className='c-section__header-underline' />
      </h2>
    )}

    <div className='c-section__content'>
      {children}
    </div>
  </section>
);

Section.displayName = 'Section';
