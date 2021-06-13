import React, {ReactNode, Fragment} from 'react';
import c from 'classnames';

import {CleanList} from '@client/components/ui';
import {HomeLink} from '@client/routes/Links';
import {
  ChevronRightIcon,
  HomeIcon,
} from '@client/components/svg/Icons';

export type BreadcrumbInfo = {
  id: string,
  node: ReactNode,
  title?: string,
};

type BreadcrumbsProps = {
  padding?: string,
  className?: string,
  items?: BreadcrumbInfo[],
};

export const Breadcrumbs = (
  {
    padding,
    items = [],
    className,
  }: BreadcrumbsProps,
) => {
  const mergedItems: BreadcrumbInfo[] = [
    {
      id: 'home',
      node: (
        <HomeLink>
          <HomeIcon />
        </HomeLink>
      ),
    },
    ...items,
  ];

  return (
    <CleanList
      className={c(
        'c-breadcrumbs',
        padding && `has-${padding}-padding`,
        className,
      )}
      spaced={2}
      inline
    >
      {mergedItems.map(
        ({id, node, title}, index) => (
          <Fragment key={id}>
            <li
              className='c-breadcrumbs__item'
              title={title}
            >
              {node}
            </li>

            {index !== mergedItems.length - 1 && (
              <li className='c-breadcrumbs__item is-divider'>
                <ChevronRightIcon />
              </li>
            )}
          </Fragment>
        ),
      )}
    </CleanList>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';
