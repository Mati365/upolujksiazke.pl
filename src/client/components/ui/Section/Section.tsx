import React, {ReactNode} from 'react';
import c from 'classnames';

import {BasicWrapperProps} from '@client/components/ui';

export type SectionProps = BasicWrapperProps & {
  title?: ReactNode,
  titleSuffix?: ReactNode,
  spaced?: number,
  bordered?: boolean,
  subsection?: boolean,
  noContentSpacing?: boolean,
  contentClassName?: string,
  headerClassName?: string,
  headerSpace?: string,
};

export const Section = (
  {
    title,
    titleSuffix,
    spaced = 4,
    bordered = true,
    noContentSpacing = true,
    headerSpace,
    className,
    subsection,
    contentClassName,
    headerClassName,
    children,
  }: SectionProps,
) => (
  <section
    className={c(
      'c-section',
      spaced && `is-spaced-${spaced}`,
      bordered && 'is-divided',
      subsection && 'is-subsection',
      className,
    )}
  >
    {title && (
      <h2
        className={c(
          'c-section__header',
          headerSpace && `has-${headerSpace}-space`,
          headerClassName,
        )}
      >
        {title}
        {titleSuffix && (
          <span className='c-section__header-suffix'>
            {titleSuffix}
          </span>
        )}
        <span className='c-section__header-underline' />
      </h2>
    )}

    <div
      className={c(
        'c-section__content',
        noContentSpacing && 'has-no-spacing',
        contentClassName,
      )}
    >
      {children}
    </div>
  </section>
);

Section.displayName = 'Section';
