import React, {ReactNode} from 'react';
import c from 'classnames';

type BookHeaderAttributeProps = {
  className?: string,
  label: ReactNode,
  children: ReactNode,
};

export const BookHeaderAttribute = ({className, label, children}: BookHeaderAttributeProps) => (
  <div
    className={c(
      'c-book-info-section__header-attr',
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
