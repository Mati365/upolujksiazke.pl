import React, {ReactNode} from 'react';
import c from 'classnames';

export type SidebarSectionProps = JSX.IntrinsicElements['div'] & {
  bold?: boolean,
  title?: ReactNode,
  tag?: any,
  sticky?: boolean,
};

export const SidebarSection = (
  {
    tag: Tag = 'section',
    children,
    className,
    bold = true,
    sticky,
    title,
    ...props
  }: SidebarSectionProps,
) => (
  <Tag
    className={c(
      'c-sidebar-section',
      sticky && 'is-sticky',
      className,
    )}
    {...props}
  >
    {title && (
      <h3
        className={c(
          'c-sidebar-section__title',
          bold && 'is-bold',
        )}
      >
        {title}
      </h3>
    )}

    {children}
  </Tag>
);

SidebarSection.displayName = 'SidebarSection';
