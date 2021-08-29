import React, {ReactNode} from 'react';
import {Link, LinkProps} from 'react-router-dom';
import {matchPath, useLocation} from 'react-router';
import * as R from 'ramda';
import c from 'classnames';

import {buildURL} from '@shared/helpers/urlEncoder';

type LinkItem<I> = I & {
  url?: string,
};

export type UndecoratedLinkProps<I = {}, P = {}> = P & {
  urlGenerator?: string | LinkURLGeneratorFn<I, P>,
  children?: ReactNode,
  className?: string,
  additionalClassName?: string,
  activeClassName?: string,
  item?: LinkItem<I>,
  searchParams?: object,
  state?: object,
  absolute?: boolean,
  underline?: boolean,
  hoverUnderline?: boolean,
  undecorated?: boolean,
  disabled?: boolean,
  href?: string,
  hash?: string,
  rel?: string,
  utm?: object,
  title?: string,
  action?: string,
  spaMode?: boolean,
  withChevron?: boolean,
  onClick?: React.MouseEventHandler,
};

type LinkURLGeneratorFn<I, P> = (item: LinkItem<I>, props: P, action: string) => string;

export function UndecoratedLink<I = {}, P = {}>(
  {
    urlGenerator, underline,
    activeClassName, additionalClassName,
    searchParams, state, absolute, action,
    href, hash, utm, item, className, spaMode,
    disabled, rel, withChevron,
    hoverUnderline = true,
    undecorated = true,
    ...props
  }: UndecoratedLinkProps<I, P>,
) {
  const location = useLocation();
  const urlGeneratorFn = (
    R.is(String, urlGenerator)
      ? () => urlGenerator
      : urlGenerator
  ) as LinkURLGeneratorFn<I, P>;

  let url = href || item?.url;
  if (!url && urlGeneratorFn)
    url = urlGeneratorFn(item, props as P, action);

  if (utm) {
    searchParams = searchParams || {};
    R.forEachObjIndexed(
      (value: string | number, key: string) => {
        searchParams[`utm_${key}`] = value;
      },
      utm,
    );
  }

  let to: LinkProps['to'] = (
    searchParams
      ? buildURL(url, searchParams)
      : url
  );

  if (action && !urlGeneratorFn)
    to += (R.endsWith('/', to as string) ? '' : '/') + action;

  if (hash && !R.includes('#', to as string))
    to = `${to}#${hash}`;

  if (state) {
    to = {
      pathname: to as string,
      state,
    };
  }

  const renderLink = (active: boolean) => {
    const mergedClassName = c(
      className,
      additionalClassName,
      undecorated && 'is-undecorated-link',
      underline && 'is-text-underline',
      hoverUnderline && 'has-hover-underline',
      active && activeClassName,
      disabled && 'is-disabled',
      withChevron && 'has-double-link-chevron',
    );

    if (!spaMode && typeof to === 'string') {
      return (
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        <a
          className={mergedClassName}
          {...!disabled && {
            href: to,
            rel,
          }}
          {...props}
        />
      );
    }

    return (
      <Link
        to={to}
        className={mergedClassName}
        rel={rel}
        {...props}
      />
    );
  };

  if (activeClassName) {
    return renderLink(
      !!matchPath(
        location.pathname,
        {
          exact: true,
          path: to as string,
        },
      ),
    );
  }

  return renderLink(false);
}

UndecoratedLink.displayName = 'UndecoratedLink';

UndecoratedLink.create = function createContainerLink<I = {}, P = {}>(urlGenerator: string | LinkURLGeneratorFn<I, P>) {
  const GeneratedLink = (props: Omit<UndecoratedLinkProps<I, P>, 'urlGenerator'>) => (
    <UndecoratedLink<I, P>
      {...props as any}
      urlGenerator={urlGenerator}
    />
  );

  GeneratedLink.displayName = 'GeneratedLink';

  return GeneratedLink;
};
