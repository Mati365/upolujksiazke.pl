import * as R from 'ramda';

import {ID} from '@shared/types';
import {decodeJWT} from './helpers/decodeJWT';

export type JWTTokens = {
  token: string,
  refreshToken: string,
};

export type DecodedJWT = {
  iat: number,
  exp: number,
  id: ID,
  username: string,
  resetPasswordRequired?: boolean,
};

export type APITokenAccessorListeners = {
  onTokensUpdated?(tokens: APITokenAccessor): void;
};

/**
 * Accessors allow to detect revoke token
 */
export class APITokenAccessor {
  static TOKEN_DURATION_MARGIN: number = 5000;

  public token: string;
  public refreshToken: string;
  public decoded: DecodedJWT;

  constructor(
    token?: string,
    refreshToken?: string,
    private listeners: APITokenAccessorListeners = {},
  ) {
    if (token || refreshToken) {
      this.setTokens(
        {
          token,
          refreshToken,
        },
      );
    }
  }

  preload() {}

  clear(silent?: boolean) {
    this.setTokens(
      {
        silent,
        token: null,
        refreshToken: null,
      },
    );
  }

  shouldRefreshToken(): boolean {
    return this.isExpired() && this.isAuthorized();
  }

  isExpired(): boolean {
    const {decoded} = this;

    if (!decoded)
      return true;

    return Date.now() + APITokenAccessor.TOKEN_DURATION_MARGIN >= +new Date(decoded.exp * 1000);
  }

  isAuthorized(): boolean {
    return !R.isNil(this.decoded?.exp);
  }

  getTokens(): JWTTokens {
    return this;
  }

  setTokens(
    {
      silent,
      token,
      refreshToken,
    }: JWTTokens & {
      silent?: boolean,
    },
  ): APITokenAccessor {
    this.token = token;
    this.refreshToken = refreshToken;
    this.decoded = decodeJWT(token)?.payload as any;

    if (!silent) {
      // eslint-disable-next-line no-unused-expressions
      this.listeners?.onTokensUpdated?.(this);
    }

    return this;
  }
}
