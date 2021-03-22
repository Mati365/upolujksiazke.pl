import React, {ComponentType, ReactNode} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {CleanList} from '@client/components/ui';

export type IconPropertyInfo = {
  name: string,
  value?: ReactNode,
  icon: ComponentType<{
    className?: string,
  }>,
};

export type IconPropertiesListProps = {
  className?: string,
  items: IconPropertyInfo[],
};

export const IconPropertiesList = ({items, className}: IconPropertiesListProps) => (
  <CleanList
    className={c(
      'c-icon-props-list',
      className,
    )}
    align='top'
    spaced={6}
    block
    inline
    wrap
  >
    {items.map(
      ({name, value, icon: Icon}) => (
        R.isNil(value)
          ? null
          : (
            <li
              key={name}
              className='c-icon-props-list__item'
            >
              <h4 className='c-icon-props-list__title'>
                {name}
              </h4>

              <Icon className='c-icon-props-list__icon' />

              <div className='c-icon-props-list__value'>
                {value}
              </div>
            </li>
          )
      ),
    )}
  </CleanList>
);

IconPropertiesList.displayName = 'IconPropertiesList';
