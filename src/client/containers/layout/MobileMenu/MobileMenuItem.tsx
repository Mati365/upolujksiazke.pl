import React, {ReactNode} from 'react';
import {
  UndecoratedLink,
  UndecoratedLinkProps,
} from '@client/components/ui';

type MobileMenuItemProps = UndecoratedLinkProps & {
  icon: ReactNode,
  title: string,
  anchorTitle?: string,
  tag?: any,
};

export const MobileMenuItem = (
  {
    icon,
    title,
    anchorTitle,
    tag: Tag = UndecoratedLink,
    ...props
  }: MobileMenuItemProps,
) => (
  <Tag
    className='c-mobile-menu__item'
    title={
      anchorTitle ?? title
    }
    {...Tag === UndecoratedLink && {
      activeClassName: 'is-active',
    }}
    {...props}
  >
    <div className='c-mobile-menu__item-icon'>
      {icon}
    </div>

    <div className='c-mobile-menu__item-title'>
      {title}
    </div>
  </Tag>
);

MobileMenuItem.displayName = 'MobileMenuItem';
