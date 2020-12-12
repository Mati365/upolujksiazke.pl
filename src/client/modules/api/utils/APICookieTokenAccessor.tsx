import {
  JWT_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@client/constants/cookies';

import {
  APITokenAccessor,
  JWTTokens,
  APITokenAccessorListeners,
} from './APITokenAccessor';

import {
  CookiesDriver,
  WebCookiesDriver,
} from './drivers';

/**
 * Accessors allow to detect revoke token
 */
export class APICookieTokenAccessor extends APITokenAccessor {
  private tokenCookie: string;
  private refreshTokenCookie: string;
  public readonly cookiesDriver: CookiesDriver;

  constructor(
    {
      tokenCookie = JWT_TOKEN_COOKIE,
      refreshTokenCookie = REFRESH_TOKEN_COOKIE,
      cookiesDriver = new WebCookiesDriver,
      listeners,
    }: {
      cookiesDriver?: CookiesDriver,
      tokenCookie?: string,
      refreshTokenCookie?: string,
      listeners?: APITokenAccessorListeners,
    } = {},
  ) {
    super(null, null, listeners);

    this.tokenCookie = tokenCookie;
    this.refreshTokenCookie = refreshTokenCookie;
    this.cookiesDriver = cookiesDriver;
  }

  preload() {
    this.loadCookies(true);
  }

  setTokens(
    {
      writeCookie = true,
      ...tokens
    }: JWTTokens & {
      silent?: boolean,
      writeCookie?: boolean,
    },
  ): APICookieTokenAccessor {
    super.setTokens(tokens);

    if (writeCookie) {
      const {decoded, tokenCookie, refreshTokenCookie, cookiesDriver} = this;
      const {token, refreshToken} = tokens;

      if (decoded) {
        cookiesDriver.set(tokenCookie, token, {expires: new Date('2200')});
        cookiesDriver.set(refreshTokenCookie, refreshToken, {expires: new Date('2200')});
      } else {
        cookiesDriver.remove(tokenCookie);
        cookiesDriver.remove(refreshTokenCookie);
      }
    }

    return this;
  }

  shouldRefreshToken(): boolean {
    if (!super.shouldRefreshToken())
      return false;

    this.loadCookies(true);
    return super.shouldRefreshToken();
  }

  private loadCookies(silent?: boolean): void {
    const {cookiesDriver, tokenCookie, refreshTokenCookie} = this;

    this.setTokens(
      {
        token: cookiesDriver.get(tokenCookie),
        refreshToken: cookiesDriver.get(refreshTokenCookie),
        writeCookie: false,
        silent,
      },
    );
  }
}
