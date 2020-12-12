import camelize from 'camelcase-keys';
import decamelize from 'snakecase-keys';
import * as R from 'ramda';

import {pickNonEmpty} from '@shared/helpers/pickNonEmpty';
import {buildURL} from '@shared/helpers/urlEncoder';
import {safeArray} from '@shared/helpers/safeArray';

import {AppAPIRepo} from '../repository/AppAPIRepo';
import {APICookieTokenAccessor} from './APICookieTokenAccessor';
import {
  JWTTokens,
  APITokenAccessor,
} from './APITokenAccessor';

import {extractFiles} from './helpers/extractFiles';

export type APIResponse<T> = T & {
  code?: number,
  message?: string,
};

export type APIConfig = {
  url: string,
  headers?: object,
  tokenAccessor?: APITokenAccessor,
  camelizeResponse?: boolean,
  decamelizeFormBody?: boolean,
  jwtAuthorization?: boolean,
};

export type APICallConfig = {
  method?: 'POST'|'GET'|'PATCH'|'PUT'|'DELETE',
  headers?: object,
  path?: string,
  urlParams?: object,
  body?: JSON|object|BodyInit,
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
 * Simple Panel API client
 *
 * @export
 * @class APIClient
 */
export class APIClient {
  private _config: APIConfig;
  private _tokenRefreshPromise: Promise<void>;
  private _repo: AppAPIRepo;

  constructor(config: APIConfig) {
    this._config = {
      ...config,
      camelizeResponse: config.camelizeResponse ?? true,
      decamelizeFormBody: config.decamelizeFormBody ?? true,
      tokenAccessor: config.tokenAccessor ?? new APITokenAccessor,
    };
    this._repo = new AppAPIRepo(this);

    if (this.jwtAuthorization)
      this.config.tokenAccessor.preload();
  }

  get jwtAuthorization() {
    return !!this.config.jwtAuthorization;
  }

  get repo() {
    return this._repo;
  }

  get config() {
    return this._config;
  }

  get cookies() {
    return (this._config.tokenAccessor as APICookieTokenAccessor).cookiesDriver;
  }

  /**
   * Performs API call
   *
   * @param {APICallConfig} {method, path, urlParams, headers, body}
   * @returns {Promise<JSON>}
   * @memberof APIClient
   */
  async apiCall<T>({method, path, urlParams, headers, body}: APICallConfig): Promise<APIResponse<T>> {
    const {
      camelizeResponse,
      decamelizeFormBody,
      url, tokenAccessor,
      headers: globalHeaders,
    } = this.config;

    const authToken = tokenAccessor?.getTokens().token;

    // check if whole body is File
    if (R.is(File, body)) {
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
      buildURL(`${url}/${path}`, pickNonEmpty(urlParams)),
      {
        method,
        headers: {
          Accept: 'application/json',
          ...!R.is(FormData, body) && {
            'Content-Type': 'application/json',
          },
          ...authToken && {
            Authorization: `Bearer ${authToken}`,
          },
          ...globalHeaders,
          ...headers,
        },
        ...body && {
          body: (
            R.is(FormData, body)
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
    const {tokenAccessor} = this.config;
    const {refreshToken} = tokenAccessor.getTokens();

    if (!refreshToken)
      throw new Error('Missing refresh token!');

    try {
      const data = await this.apiCall<JWTTokens>(
        {
          method: 'POST',
          path: 'auth/refresh-token',
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
    const {jwtAuthorization, tokenAccessor} = this.config;

    if (jwtAuthorization) {
      if (tokenAccessor.shouldRefreshToken()) {
        // init request
        if (!this._tokenRefreshPromise)
          this._tokenRefreshPromise = this.refreshTokens();

        // wait for done
        await this._tokenRefreshPromise;
      }
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
