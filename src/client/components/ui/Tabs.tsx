import React, {useEffect, useState, MouseEventHandler, ReactNode, ComponentType} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {isID} from '@shared/guards/isID';
import {
  findObjectNonCasedKey,
  uniqFlatHashBy,
  findById,
} from '@shared/helpers';

import {IconListItem, ID, ListItem} from '@shared/types';
import {CleanList} from './CleanList';

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
  customNavRenderFn?(
    attrs: {
      items: IconListItem[],
      activeTab: ListItem,
      setActiveTab(item: ListItem | ID): void,
    },
  ): ReactNode,
};

export const Tabs = (
  {
    initialTab,
    prependNav,
    textOnly,
    className,
    align,
    children,
    customNavRenderFn,
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
  let nav: ReactNode = null;

  if (customNavRenderFn) {
    const items = (
      React.Children
        .map(children, (child) => {
          if (!child)
            return null;

          const {id, title, icon} = (child as any).props;
          return {
            id,
            icon,
            name: title,
          };
        })
        .filter(Boolean)
    );

    nav = (
      <div className='c-tabs__nav'>
        {customNavRenderFn(
          {
            items,
            activeTab: findById(activeTabId)(items),
            setActiveTab: (item) => {
              if (R.isNil(item) || isID(item))
                setActiveTab(item);
              else
                setActiveTab((item as any).id);
            },
          },
        )}
      </div>
    );
  } else {
    nav = (
      <CleanList
        block
        inline
        separated
        spaced={4}
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
      </CleanList>
    );
  }

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
      {nav}
      {content}
    </div>
  );
};

Tabs.Tab = Tab;
