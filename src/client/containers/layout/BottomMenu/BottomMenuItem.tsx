import React, {ReactNode} from 'react';
import {
  UndecoratedLink,
  UndecoratedLinkProps,
} from '@client/components/ui';

type BottomMenuItemProps = UndecoratedLinkProps & {
  icon: ReactNode,
  title: string,
  tag?: any,
};

export const BottomMenuItem = (
  {
    icon,
    title,
    tag: Tag = UndecoratedLink,
    ...props
  }: BottomMenuItemProps,
) => (
  <Tag
    className='c-bottom-menu__item'
    {...Tag === UndecoratedLink && {
      activeClassName: 'is-active',
    }}
    {...props}
  >
    <div className='c-bottom-menu__item-icon'>
      {icon}
    </div>

    <div className='c-bottom-menu__item-title'>
      {title}
    </div>
  </Tag>
);

BottomMenuItem.displayName = 'BottomMenuItem';
