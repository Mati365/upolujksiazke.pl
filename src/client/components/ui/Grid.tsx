import React, {ReactNode} from 'react';
import c from 'classnames';

export type GridProps = {
  className?: string,
  columns?: number,
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
        `has-${columns}-columns`,
      ],
      className,
    )}
  >
    {children}
  </section>
);

Grid.displayName = 'Grid';
