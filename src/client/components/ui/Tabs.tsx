import React, {useEffect, useState, MouseEventHandler, ReactNode, ComponentType} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {
  findObjectNonCasedKey,
  uniqFlatHashBy,
} from '@shared/helpers';

type TabProps = {
  title: string,
  id: any,
  icon?: ComponentType<{className?: string}>,
  active?: boolean,
  children?: () => React.ReactNode,
  onClick?: MouseEventHandler,
};

export const Tab = (
  {
    icon: Icon,
    id, title,
    active, onClick,
  }: TabProps,
) => (
  <li
    className={c(
      'c-tabs__tab',
      active && 'is-active',
    )}
  >
    <a
      className='is-undecorated-link'
      title={title}
      href={`#${R.toLower(id)}`}
      onClick={onClick}
    >
      {Icon && (
        <Icon className='c-tabs__tab-icon' />
      )}
      {title}
    </a>
  </li>
);

type TabsProps = {
  className?: string,
  textOnly?: boolean,
  initialTab?: any,
  align?: string,
  prependNav?: ReactNode,
  children: ReactNode,
};

export const Tabs = (
  {
    initialTab,
    prependNav,
    textOnly,
    className,
    align,
    children,
  }: TabsProps,
) => {
  const childrenMap: any = uniqFlatHashBy<any>(
    (item) => item?.props.id,
    React.Children.toArray(children),
  );

  const [activeTabId, setActiveTab] = useState(
    () => R.defaultTo(R.keys(childrenMap)[0], initialTab),
  );

  const tabElement: any = childrenMap[activeTabId];
  const list = (
    <ul
      className={c(
        'c-tabs__nav',
        align && `is-aligned-${align}`,
      )}
    >
      {prependNav}
      {React.Children.map(
        children,
        (child) => {
          if (!child)
            return null;

          const {id} = (child as any).props;
          const active = id === activeTabId;

          return React.cloneElement(
            child as any,
            {
              key: id,
              active,
              onClick: () => setActiveTab(id),
            },
            null,
          );
        },
      )}
    </ul>
  );

  const content = tabElement?.props.children(
    {
      activeTabId,
      setActiveTab,
    },
  );

  useEffect(
    () => {
      const {hash} = document.location;
      if (!hash)
        return;

      const key = findObjectNonCasedKey(hash.substr(1), childrenMap);
      if (key)
        setActiveTab(key);
    },
    [],
  );

  return (
    <div
      className={c(
        'c-tabs',
        textOnly && 'is-text-only',
        className,
      )}
    >
      {list}
      {content}
    </div>
  );
};

Tabs.Tab = Tab;
