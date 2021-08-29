import camelize from 'camelcase-keys';
import decamelize from 'snakecase-keys';
import * as R from 'ramda';

import {isSSR} from '@shared/helpers';
import {pickNonEmpty} from '@shared/helpers/pickNonEmpty';
import {buildURL} from '@shared/helpers/urlEncoder';
import {safeArray} from '@shared/helpers/safeArray';
import {concatUrls} from '@shared/helpers/concatUrls';

import {JwtCookiesTokenAccessor} from './accessors/JwtCookiesTokenAccessor';
import {
  JWTTokens,
  JwtTokenAccessor,
} from './accessors/JwtTokenAccessor';

import {extractFiles} from './helpers/extractFiles';

export type APIResponse<T> = T & {
  code?: number,
  message?: string,
};

export type APIConfig = {
  url: string,
  headers?: object,
  tokenAccessor?: JwtTokenAccessor,
  camelizeResponse?: boolean,
  decamelizeFormBody?: boolean,
  tokenIsAlwaysRequired?: boolean,
  withAuthorizationHeader?: boolean,
  customTokensRefreshFn?(prevTokens: JWTTokens): Promise<JWTTokens>,
};

export type APICallConfig = {
  method?: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'DELETE',
  headers?: object,
  path?: string,
  urlParams?: object,
  body?: JSON | object | BodyInit,
  ignoreLocks?: boolean,
};

export class APIError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly messages: string[] = null,
  ) {
    super(message);
  }
}

/**
 * Simple JWT API client
 *
 * @export
 * @class APIClient
 */
export class JwtAPIClient {
  private _config: APIConfig;
  private _tokenRefreshPromise: Promise<void>;
  private _locks: Record<string, Promise<any>> = {};

  constructor(config: APIConfig) {
    this._config = {
      ...config,
      camelizeResponse: config.camelizeResponse ?? false,
      decamelizeFormBody: config.decamelizeFormBody ?? false,
      tokenAccessor: config.tokenAccessor ?? new JwtCookiesTokenAccessor,
    };
  }

  get config() {
    return this._config;
  }

  isLocked(name: string) {
    return !!this._locks[name];
  }

  /**
   * Assigns promise to locks map
   *
   * @param {string} name
   * @param {Promise<any>} lock
   * @return {this}
   * @memberof JwtAPIClient
   */
  setLock(name: string, lock: Promise<any>): this {
    this._locks[name] = new Promise<void>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve) => {
        try {
          await lock;
        } catch (e) {
          console.error(e);
        }

        delete this._locks[name];
        resolve();
      },
    );

    return this;
  }

  setLockIfNotPresent(name: string, fn: () => Promise<any>) {
    if (!R.has(name, this._locks))
      this.setLock(name, fn());
  }

  /**
   * Performs API call
   *
   * @param {APICallConfig} {method, path, urlParams, headers, body}
   * @returns {Promise<JSON>}
   * @memberof APIClient
   */
  async apiCall<T>(
    {
      method,
      path,
      urlParams,
      headers,
      body,
      ignoreLocks,
    }: APICallConfig,
  ): Promise<APIResponse<T>> {
    const {
      camelizeResponse,
      decamelizeFormBody,
      url,
      tokenAccessor,
      headers: globalHeaders,
      withAuthorizationHeader = true,
    } = this.config;

    // used for silent registering user
    if (!ignoreLocks && !R.isEmpty(this._locks)) {
      await Promise.all(
        R.values(this._locks),
      );
    }

    const ssr = isSSR();
    const authToken = tokenAccessor?.getTokens().token;

    // check if whole body is File
    if (!ssr && R.is(File, body)) {
      body = {
        file: body,
      };
    }

    if (body && R.is(Object, body)) {
      // check if provided json contains files
      const files = extractFiles(body);

      if (files.length) {
        const form = new FormData;

        form.append('body', JSON.stringify(body));
        files.forEach((fileDescriptor) => {
          form.append('files', fileDescriptor.file, fileDescriptor.path);
        });

        body = form;
      }
    }

    const result = await fetch(
      buildURL(
        concatUrls(url, path),
        pickNonEmpty(urlParams),
      ),
      {
        method,
        headers: {
          Accept: 'application/json',
          ...(ssr || !R.is(FormData, body)) && {
            'Content-Type': 'application/json',
          },
          ...authToken && withAuthorizationHeader && {
            Authorization: `Bearer ${authToken}`,
          },
          ...globalHeaders,
          ...headers,
        },
        ...body && {
          body: (
            !ssr && R.is(FormData, body)
              ? body as any
              : JSON.stringify(
                decamelizeFormBody
                  ? decamelize(body as any, {deep: true})
                  : body,
              )
          ),
        },
      },
    );

    let data = null;
    try {
      data = await result.json();
    } catch (e) {
      if (!result.ok) {
        console.error(e);
        data = {
          msg: e.toString(),
        };
      } else
        data = null;
    }

    if (!result.ok || (!R.isNil(data?.code) && data.code >= 400 && data.code < 600)) {
      const errorTitle = 'Error response from server';

      if (R.is(Object, data.msg) && !R.is(Array, data.msg)) {
        throw new APIError(
          data.code,
          errorTitle,
          R.compose(
            R.map(
              ([field, value]) => `${field}: ${safeArray(value).join(', ')}`,
            ),
            R.toPairs,
          )(data.msg),
        );
      }

      throw new APIError(
        data.code,
        errorTitle,
        safeArray(data.msg ?? data.message ?? errorTitle),
      );
    }

    if (camelizeResponse && !R.isNil(data))
      return camelize(data, {deep: true});

    return data;
  }

  /**
   * Renew token in API
   *
   * @returns {Promise<void>}
   * @memberof APIClient
   */
  async refreshTokens(): Promise<void> {
    const {tokenAccessor, customTokensRefreshFn} = this.config;
    const {refreshToken} = tokenAccessor.getTokens();

    if (customTokensRefreshFn) {
      tokenAccessor.setTokens(
        await customTokensRefreshFn(tokenAccessor.getTokens()),
      );

      return;
    }

    if (!refreshToken)
      throw new Error('Missing refresh token!');

    try {
      const data = await this.apiCall<JWTTokens>(
        {
          method: 'POST',
          path: 'users/refresh-token',
          body: tokenAccessor && {
            refreshToken,
          },
        },
      );

      if (!data || !data.token || !data.refreshToken)
        throw new Error('Incorrect refresh token response!');

      tokenAccessor.setTokens(data);
    } catch (e) {
      tokenAccessor.clear(true);
      throw e;
    }
  }

  /**
   * Checks if token expired, if not - call, if yes - refetch
   *
   * @template T
   * @param {APICallConfig} callConfig
   * @returns {Promise<T>}
   * @memberof APIClient
   */
  async verifiedApiCall<T>(callConfig: APICallConfig): Promise<T> {
    const {tokenAccessor, tokenIsAlwaysRequired} = this.config;

    if (tokenAccessor.shouldRefreshToken()
        || (tokenIsAlwaysRequired && tokenAccessor.isEmptyToken())) {
      // init request
      if (!this._tokenRefreshPromise)
        this._tokenRefreshPromise = this.refreshTokens();

      // wait for done
      await this._tokenRefreshPromise;
      this._tokenRefreshPromise = null;
    }

    return this.apiCall<T>(callConfig);
  }

  /**
   * Performs GET call
   *
   * @template T
   * @param {APICallConfig} callConfig
   * @returns {Promise<T>}
   * @memberof APIClient
   */
  get<T>(callConfig: APICallConfig): Promise<T> {
    return this.verifiedApiCall(
      {
        ...callConfig,
        method: 'GET',
      },
    );
  }

  /**
   * Performs POST call
   *
   * @template T
   * @param {APICallConfig} callConfig
   * @returns {Promise<T>}
   * @memberof APIClient
   */
  post<T>(callConfig: APICallConfig): Promise<T> {
    return this.verifiedApiCall(
      {
        ...callConfig,
        method: 'POST',
      },
    );
  }

  /**
   * Performs PATCH call
   *
   * @template T
   * @param {APICallConfig} callConfig
   * @returns {Promise<T>}
   * @memberof APIClient
   */
  patch<T>(callConfig: APICallConfig): Promise<T> {
    return this.verifiedApiCall(
      {
        ...callConfig,
        method: 'PATCH',
      },
    );
  }

  /**
   * Performs PUT call
   *
   * @template T
   * @param {APICallConfig} callConfig
   * @returns {Promise<T>}
   * @memberof APIClient
   */
  put<T>(callConfig: APICallConfig): Promise<T> {
    return this.verifiedApiCall(
      {
        ...callConfig,
        method: 'PUT',
      },
    );
  }

  /**
   * Performs DELETE call
   *
   * @template T
   * @param {APICallConfig} callConfig
   * @returns {Promise<T>}
   * @memberof APIClient
   */
  delete<T>(callConfig: APICallConfig): Promise<T> {
    return this.verifiedApiCall(
      {
        ...callConfig,
        method: 'DELETE',
      },
    );
  }
}
