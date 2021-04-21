import React, {ReactNode} from 'react';
import c from 'classnames';
import {linkInputs, LinkProps} from '@client/decorators/linkInput';

type CheckboxGroupProps = LinkProps<boolean> & {
  type?: string,
  className?: string,
  children?: ReactNode,
};

export const CheckboxGroup = linkInputs<boolean>()((
  {
    type = 'square',
    className,
    children,
    l,
  }: CheckboxGroupProps,
) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label
    className={c(
      'c-checkbox-group',
      type && `is-${type}`,
      className,
    )}
  >
    <input
      className='c-checkbox-group__input'
      type='checkbox'
      {...l.input(
        null,
        {
          valueAttrName: 'checked',
          defaultValue: false,
        },
      )}
    />
    <span className='c-checkbox-group__btn' />
    <span className='c-checkbox-group__title'>
      {children}
    </span>
  </label>
));

CheckboxGroup.displayName = 'CheckboxGroup';
