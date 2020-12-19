import md5 from 'md5';
import querystring from 'querystring';
import * as R from 'ramda';

export type WykopBodyParams = Record<string, any>;

export type WykopRequestParams = {
  method?: 'GET' | 'POST',
  path: string,
  body?: any,
  noAuthCheck?: boolean,
};

export type WykopAPIAuthParams = {
  key: string,
  secret: string,
  account: {
    key: string,
    name: string,
  },
};

export type WykopAPIResponse = {
  data?: any,
  pagination?: {
    next: string,
    prev: string,
  },
  errors?: {
    code: number,
    field?: string,
  },
};

/**
 * Transforms any object to unicode
 *
 * @export
 * @param {*} val
 * @returns
 */
export function toUnicode(val: any) {
  return unescape(encodeURIComponent(val));
}

/**
 * API v2 client
 *
 * @export
 * @class WykopAPI
 */
export class WykopAPI {
  static API_URL = 'https://a2.wykop.pl';

  private userkey: string;

  constructor(
    public readonly authConfig: WykopAPIAuthParams,
  ) {}

  static stringifyBodyValues(body: WykopBodyParams) {
    return R.compose(
      R.join(','),
      R.map(toUnicode),
      R.values,
    )(body ?? {});
  }

  /**
   * Performs request to API
   *
   * @param {WykopRequestParams} params
   * @returns {Promise<WykopAPIResponse>}
   * @memberof WykopAPI
   */
  async call(params: WykopRequestParams): Promise<WykopAPIResponse> {
    const {userkey, authConfig} = this;
    if (!userkey && !params.noAuthCheck) {
      await this.authorize();
      return this.call(params);
    }

    const {secret, key} = authConfig;
    const {
      method = 'GET',
      path,
      body,
    } = params;

    let url = `${WykopAPI.API_URL}/${path}/appkey/${key}/`;
    if (userkey)
      url += `userkey/${userkey}/`;

    const response = await fetch(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          apisign: md5(`${secret}${url}${WykopAPI.stringifyBodyValues(body)}`),
        } as any,

        ...body && {
          body: querystring.stringify(
            R.mapObjIndexed(toUnicode, body),
          ),
        },
      },
    );

    // token expired
    if (userkey && response.status === 401) {
      await this.authorize();
      return this.call(params);
    }

    return response.json();
  }

  /**
   * Authorize to API
   *
   * @memberof WykopAPI
   */
  async authorize() {
    const {account} = this.authConfig;
    const {data: {userkey}} = await this.call(
      {
        noAuthCheck: true,
        method: 'POST',
        path: 'Login/Index',
        body: {
          login: account.name,
          accountkey: account.key,
        },
      },
    );

    this.userkey = userkey;
  }
}
