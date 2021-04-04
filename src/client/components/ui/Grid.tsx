import React, {ReactNode} from 'react';
import c from 'classnames';

export type GridProps = {
  className?: string,
  columns?: {
    xs?: number,
    default?: number,
  },
  gap?: number,
  children?: ReactNode,
};

export const Grid = ({columns, gap, className, children}: GridProps) => (
  <section
    className={c(
      'c-grid',
      gap && `has-${gap}-gap`,
      columns && [
        'has-fixed-columns-count',

        columns.xs && `has-${columns.xs}-xs-columns`,
        columns.default && `has-${columns.default}-columns`,
      ],
      className,
    )}
  >
    {children}
  </section>
);

Grid.displayName = 'Grid';
