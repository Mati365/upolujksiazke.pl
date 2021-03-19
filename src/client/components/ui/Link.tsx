import React, {ReactNode} from 'react';
import {Link, LinkProps} from 'react-router-dom';
import * as R from 'ramda';
import c from 'classnames';
import {buildURL} from '@shared/helpers/urlEncoder';

type LinkItem<I> = I & {
  url?: string,
};

export type ContainerLinkProps<I = {}, P = {}> = P & {
  urlGenerator: string | LinkURLGeneratorFn<I, P>,
  children?: ReactNode,
  className?: string,
  item?: LinkItem<I>,
  searchParams?: object,
  state?: object,
  absolute?: boolean,
  underline?: boolean,
  href?: string,
  hash?: string,
  utm?: object,
  action?: string,
  onClick?: React.MouseEventHandler,
};

type LinkURLGeneratorFn<I, P> = (item: LinkItem<I>, props: P, action: string) => string;

export function ContainerLink<I = {}, P = {}>(
  {
    urlGenerator, underline,
    searchParams, state, absolute, action,
    href, hash, utm, item, className,
    ...props
  }: ContainerLinkProps<I, P>,
) {
  const urlGeneratorFn = (
    R.is(String, urlGenerator)
      ? () => urlGenerator
      : urlGenerator
  ) as LinkURLGeneratorFn<I, P>;

  let url = href || item?.url;
  if (!url)
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

  return (
    <Link
      to={to}
      className={c(
        className ?? `is-undecorated-link ${underline ? 'is-text-underline' : 'has-hover-underline'}`,
      )}
      {...props}
    />
  );
}

ContainerLink.displayName = 'ContainerLink';

ContainerLink.create = function createContainerLink<I = {}, P = {}>(urlGenerator: string | LinkURLGeneratorFn<I, P>) {
  const GeneratedLink = (props: Omit<ContainerLinkProps<I, P>, 'urlGenerator'>) => (
    <ContainerLink<I, P>
      {...props as any}
      urlGenerator={urlGenerator}
    />
  );

  GeneratedLink.displayName = 'GeneratedLink';

  return GeneratedLink;
};
