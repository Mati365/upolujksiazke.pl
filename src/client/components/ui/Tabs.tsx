import React, {useState, MouseEventHandler, ReactNode, useEffect} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {uniqFlatHashBy} from '@shared/helpers';

type TabProps = {
  title: string,
  id: any,
  active?: boolean,
  children?: () => React.ReactNode,
  onClick?: MouseEventHandler,
};

export const Tab = ({id, title, active, onClick}: TabProps) => (
  <li
    className={c(
      'c-tabs__tab',
      active && 'is-active',
    )}
  >
    <a
      className='is-undecorated-link'
      title={title}
      href={`#${id}`}
      onClick={onClick}
    >
      {title}
    </a>
  </li>
);

type TabsProps = {
  className?: string,
  textOnly?: boolean,
  initialTab?: any,
  align?: string,
  children: ReactNode,
};

export const Tabs = (
  {
    initialTab,
    textOnly,
    className,
    align,
    children,
  }: TabsProps,
) => {
  const childrenMap: any = uniqFlatHashBy<any>(
    ({props}) => props.id,
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
        align && `is-${align}-aligned`,
      )}
    >
      {React.Children.map(
        children,
        (child) => {
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

      const hashID = hash.substr(1);
      if (childrenMap[hashID])
        setActiveTab(hashID);
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
