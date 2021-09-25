import {toPairs} from 'ramda';

import setCookie from 'set-cookie-parser';
import {uniqFlatHashByProp} from '@shared/helpers/uniqFlatHashByProp';

export function getRawCookies(response: Response) {
  return response.headers.get('set-cookie');
}

export function parseCookies(response: Response) {
  const raw = getRawCookies(response);
  const cookies = setCookie.parse(setCookie.splitCookiesString(raw));

  return {
    raw,
    parsed: uniqFlatHashByProp('name', cookies),
  };
}

export function cookiesObjToSetCookie(cookies: object) {
  const pairs = toPairs<any>(cookies || {});

  return pairs.reduce<string[]>(
    (acc, [name, value]) => {
      acc.push(`${name}=${value}`);
      return acc;
    },
    [],
  ).join(';');
}
