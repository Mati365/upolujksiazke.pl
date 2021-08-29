import React, {ReactNode} from 'react';
import c from 'classnames';

type BookHeaderAttributeProps = {
  label: ReactNode,
  children: ReactNode,
  className?: string,
  wrap?: boolean,
};

export const BookHeaderAttribute = (
  {
    className, label,
    children, wrap = true,
  }: BookHeaderAttributeProps,
) => (
  <div
    className={c(
      'c-book-info-section__header-attr',
      wrap && 'is-wrapped',
      className,
    )}
  >
    <div className='c-book-info-section__header-attr-label'>
      {label}
    </div>

    <div className='c-book-info-section__header-attr-value'>
      {children}
    </div>
  </div>
);

BookHeaderAttribute.displayName = 'BookHeaderAttribute';
