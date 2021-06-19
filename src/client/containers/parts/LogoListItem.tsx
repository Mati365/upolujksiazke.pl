import React, {ReactNode} from 'react';
import c from 'classnames';

type LogoListItemProps = {
  linkComponent: any,
  item: any,
  tag?: any,
  icon?: ReactNode,
  className?: string,
};

export const LogoListItem = (
  {
    tag: Tag = 'article',
    linkComponent: Link,
    icon,
    item,
    className,
  }: LogoListItemProps,
) => (
  <Tag
    className={c(
      'c-logo-list-card',
      className,
    )}
  >
    <Link
      className='c-logo-list-card__content'
      item={item}
      title={item.name}
    >
      {icon && (
        <span className='c-logo-list-card__icon'>
          {icon}
        </span>
      )}

      <span className='c-logo-list-card__title'>
        {item.name}
      </span>
    </Link>
  </Tag>
);

LogoListItem.displayName = 'LogoListItem';
