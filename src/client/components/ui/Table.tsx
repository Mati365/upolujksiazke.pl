import React from 'react';
import c from 'classnames';

type TableProps = JSX.IntrinsicElements['table'] & {
  expanded?: boolean,
  nested?: boolean,
  layout?: string,
};

export const Table = (
  {
    expanded = true,
    layout = 'fixed',
    nested,
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
      nested && 'is-nested',
      className,
    )}
    {...props}
  >
    {children}
  </table>
);

Table.displayName = 'Table';
