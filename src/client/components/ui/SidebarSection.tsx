import React, {ReactNode} from 'react';
import c from 'classnames';

type SidebarSectionProps = JSX.IntrinsicElements['div'] & {
  bold?: boolean,
  title?: ReactNode,
};

export const SidebarSection = (
  {
    children,
    className,
    bold = true,
    title,
    ...props
  }: SidebarSectionProps,
) => (
  <section
    className={c(
      'c-sidebar-section',
      className,
    )}
    {...props}
  >
    {title && (
      <div
        className={c(
          'c-sidebar-section__title',
          bold && 'is-bold',
        )}
      >
        {title}
      </div>
    )}

    {children}
  </section>
);

SidebarSection.displayName = 'SidebarSection';
