import React from 'react';
import c from 'classnames';

type TableProps = JSX.IntrinsicElements['table'] & {
  expanded?: boolean
};

export const Table = (
  {
    expanded = true,
    children,
    className,
    ...props
  }: TableProps,
) => (
  <table
    className={c(
      'c-table',
      expanded && 'is-expanded',
      className,
    )}
    {...props}
  >
    {children}
  </table>
);

Table.displayName = 'Table';
