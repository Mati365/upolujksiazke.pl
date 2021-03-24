import React from 'react';
import c from 'classnames';

type TableProps = JSX.IntrinsicElements['table'] & {
  expanded?: boolean,
  layout?: string,
};

export const Table = (
  {
    expanded = true,
    layout = 'fixed',
    children,
    className,
    ...props
  }: TableProps,
) => (
  <table
    className={c(
      'c-table',
      expanded && 'is-expanded',
      layout && `is-${layout}-layout`,
      className,
    )}
    {...props}
  >
    {children}
  </table>
);

Table.displayName = 'Table';
