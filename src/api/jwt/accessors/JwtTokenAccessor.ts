import * as R from 'ramda';
import {decodeJWT} from '../helpers';

/**
 * Type shared with admin panel / client
 *
 * @export
 * @enum {number}
 */
export type JWTTokens = {
  token: string,
  refreshToken?: string,
};

export type DecodedJWT = {
  iat?: number,
  exp?: number,
  id: number,
};

export type JwtTokenAccessorListeners = {
  onTokensUpdated?(tokens: JwtTokenAccessor): void;
};

/**
 * Accessors allow to detect revoke token
 */
export class JwtTokenAccessor {
  static TOKEN_DURATION_MARGIN: number = 5000;

  public token: string;
  public refreshToken: string;
  public decoded: DecodedJWT;

  constructor(
    token?: string,
    refreshToken?: string,
    private listeners: JwtTokenAccessorListeners = {},
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

    return Date.now() + JwtTokenAccessor.TOKEN_DURATION_MARGIN >= +new Date(decoded.exp * 1000);
  }

  isEmptyToken(): boolean {
    return !this.decoded;
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
  ): JwtTokenAccessor {
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
