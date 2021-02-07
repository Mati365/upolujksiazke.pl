import * as R from 'ramda';

export function extractHostname(url: string) {
  if (!url)
    return null;

  if (!url.startsWith('http'))
    url = `https://${url}`;

  return new URL(url).hostname;
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
