import * as R from 'ramda';
import {CanBeArray} from '@shared/types';

export type JWTToken = {
  header: object,
  payload: object,
};

export const decodeBase64 = (str: string): string => (
  typeof atob === 'undefined'
    ? Buffer.from(str, 'base64').toString('binary')
    : atob(str)
);

/**
 * Converts base64 string to javascript object
 *
 * @param {String} str
 */
export const parseBase64 = (str: string): CanBeArray<object> => R.compose(
  JSON.parse,
  decodeURIComponent,
  (_str: string) => _str.replace(/(.)/g, (m, p) => {
    let code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2)
      code = `0${code}`;

    return `%${code}`;
  }),
  decodeBase64,
)(str);

export const decodeJWT = (token: string): JWTToken => {
  if (!token)
    return null;

  try {
    const [header, payload] = R.map(
      parseBase64,
      R.take(2, R.split('.', token)),
    );

    return {
      header,
      payload,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};
