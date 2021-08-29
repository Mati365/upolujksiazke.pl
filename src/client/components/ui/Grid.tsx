import React, {ReactNode} from 'react';
import c from 'classnames';

import {ViewMode} from '@shared/enums';

export type GridProps = {
  className?: string,
  columns?: {
    xs?: number,
    default?: number,
  },
  gap?: number,
  viewMode?: ViewMode,
  children?: ReactNode,
};

export const Grid = (
  {
    columns, gap,
    className, children,
    viewMode,
  }: GridProps,
) => (
  <section
    className={c(
      'c-grid',
      gap && `has-${gap}-gap`,
      viewMode === ViewMode.LIST
        ? 'has-1-columns has-list-layout'
        : [
          'has-grid-layout',
          columns && [
            'has-fixed-columns-count',

            columns.xs && `has-${columns.xs}-xs-columns`,
            columns.default && `has-${columns.default}-columns`,
          ],
        ],
      className,
    )}
  >
    {children}
  </section>
);

Grid.displayName = 'Grid';
