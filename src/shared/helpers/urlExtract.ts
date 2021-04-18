import * as R from 'ramda';

export function extractHostname(url: string, allowWWW: boolean = true) {
  if (!url)
    return null;

  if (!url.startsWith('http'))
    url = `https://${url}`;

  let {hostname} = new URL(url);
  if (!allowWWW && hostname && R.startsWith('www.', hostname))
    hostname = hostname.substr(4);

  return hostname;
}

export function extractPathname(url: string) {
  if (!url)
    return null;

  return R.tail(new URL(url).pathname);
}

export function extractOrigin(url: string) {
  if (!url)
    return null;

  return new URL(url).origin;
}

export function extractNonSearchParamsURL(url: string) {
  const {hostname, pathname} = new URL(url);

  return `${hostname}${pathname}`;
}
