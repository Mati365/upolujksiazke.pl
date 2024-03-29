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

export type WykopAPIConfig = {
  authConfig?: WykopAPIAuthParams,
  cacheResolver?(params: WykopRequestParams): {
    data: any,
  },
};

export type WykopAPIResponse = {
  data?: any,
  pagination?: {
    next: any,
    prev: any,
  },
  errors?: {
    code: number,
    field?: string,
  },
};

/**
 * API v2 client
 *
 * @export
 * @class WykopAPI
 */
export class WykopAPI {
  static API_URL = 'https://a2.wykop.pl';

  private readonly authConfig: WykopAPIAuthParams;
  private readonly cacheResolver: WykopAPIConfig['cacheResolver'];
  private userkey: string;

  constructor(
    {
      authConfig,
      cacheResolver,
    }: WykopAPIConfig,
  ) {
    this.authConfig = authConfig;
    this.cacheResolver = cacheResolver;
  }

  static stringifyBodyValues(body: WykopBodyParams) {
    return R.compose(
      R.join(','),
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
  call = async (params: WykopRequestParams): Promise<WykopAPIResponse> => {
    const {userkey, authConfig, cacheResolver} = this;
    const cacheResult = cacheResolver?.(params);

    if (cacheResult)
      return cacheResult.data;

    if (!userkey && !params.noAuthCheck) {
      await this.authorize();
      return this.call(params);
    }

    const {secret, key} = authConfig;
    const {
      method = 'GET',
      body,
      path,
    } = params;

    let url = `${WykopAPI.API_URL}/${path}/appkey/${key}/`;
    if (userkey)
      url += `userkey/${userkey}/`;

    const response = await fetch(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          apisign: md5(`${secret}${url}${WykopAPI.stringifyBodyValues(body)}`),
        } as any,

        ...body && {
          body: querystring.stringify(
            body,
            null,
            null,
            {
              encodeURIComponent: R.identity,
            },
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
  };

  /**
   * Authorize to API
   *
   * @memberof WykopAPI
   */
  authorize = async () => {
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
  };
}
