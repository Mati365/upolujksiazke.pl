import React, {PropsWithChildren} from 'react';
import c from 'classnames';

export const RIBBON_COLORS = ['red', 'green'] as const;

export type BookRibbonProps = PropsWithChildren<{
  color?: typeof RIBBON_COLORS[number],
  component?: any,
}>;

export const BookRibbon = (
  {
    children, color,
    component: Component = 'div',
  }: BookRibbonProps,
) => (
  <Component
    className={c(
      'c-book-ribbon',
      color && `is-${color}`,
    )}
  >
    {children}
  </Component>
);

BookRibbon.displayName = 'BookRibbon';
