import setCookie from 'set-cookie-parser';
import {uniqFlatHashByProp} from '@shared/helpers/uniqFlatHashByProp';

export function getRawCookies(response: Response) {
  return response.headers.get('set-cookie');
}

export function parseCookies(response: Response) {
  const raw = getRawCookies(response);
  const cookies = setCookie.parse(setCookie.splitCookiesString(raw));

  return uniqFlatHashByProp('name', cookies);
}
