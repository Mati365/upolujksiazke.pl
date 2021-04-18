import React, {ReactNode} from 'react';
import {Link, LinkProps} from 'react-router-dom';
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
  item?: LinkItem<I>,
  searchParams?: object,
  state?: object,
  absolute?: boolean,
  underline?: boolean,
  href?: string,
  hash?: string,
  rel?: string,
  utm?: object,
  action?: string,
  spaMode?: boolean,
  onClick?: React.MouseEventHandler,
};

type LinkURLGeneratorFn<I, P> = (item: LinkItem<I>, props: P, action: string) => string;

export function UndecoratedLink<I = {}, P = {}>(
  {
    urlGenerator, underline, additionalClassName,
    searchParams, state, absolute, action,
    href, hash, utm, item, className, spaMode,
    ...props
  }: UndecoratedLinkProps<I, P>,
) {
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
      (value: string|number, key: string) => {
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

  const generatedClassName = (
    className ?? `is-undecorated-link ${underline ? 'is-text-underline' : 'has-hover-underline'}`
  );

  if (!spaMode && typeof to === 'string') {
    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a
        href={to}
        className={c(
          generatedClassName,
          additionalClassName,
        )}
        {...props}
      />
    );
  }

  return (
    <Link
      to={to}
      className={className}
      {...props}
    />
  );
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
