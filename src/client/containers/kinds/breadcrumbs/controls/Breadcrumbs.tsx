import React, {ReactNode, Fragment} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';

import {HOME_PATH} from '@client/routes/Links';

import {CleanList} from '@client/components/ui';
import {UndecoratedLink} from '@client/components/ui/Link';
import {
  ChevronRightIcon,
  HomeIcon,
} from '@client/components/svg/Icons';

import {BreadcrumbsJsonLD} from '../seo/BreadcrumbsJsonLD';

export type BreadcrumbInfo = {
  id: string,
  path: string,
  node?: ReactNode,
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
  const t = useI18n();
  const mergedItems: BreadcrumbInfo[] = [
    {
      id: 'home',
      path: HOME_PATH,
      title: t('shared.breadcrumbs.home'),
      node: <HomeIcon />,
    },
    ...items,
  ];

  return (
    <>
      <BreadcrumbsJsonLD items={mergedItems} />

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
          ({id, title, path, node = title}, index) => (
            <Fragment key={id}>
              <li className='c-breadcrumbs__item'>
                {(
                  path
                    ? (
                      <UndecoratedLink
                        href={path}
                        title={title}
                      >
                        {node}
                      </UndecoratedLink>
                    )
                    : node
                )}
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
    </>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';
